import { Request, Response } from "express";
import { supabase } from "../lib/supabaseClient";
import { Verdict } from "../models/enums";
import { analyzeApplicationAI } from "../services/aiService";
import pdf from "pdf-parse";

// -------------------------------
// Submit Application
// -------------------------------
export const submitApplication = async (req: Request, res: Response) => {
  try {
    const { jobId: rawJobId } = req.params;
    const { rawData, resumeFileUrl } = req.body;

    if (!rawJobId || !rawData || !resumeFileUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get job ID from the shareable link
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, title, company_name, job_description")
      .eq("shareable_link", rawJobId)
      .single();

    if (jobError || !job) {
      console.error("Error finding job:", jobError);
      return res.status(404).json({ error: "Job not found" });
    }

    // 1️⃣ Insert application using the actual job ID
    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .insert([
        {
          job_id: job.id,
          raw_data: rawData,
          resume_file_url: resumeFileUrl,
        },
      ])
      .select()
      .single();

    if (applicationError) throw applicationError;

    // 2️⃣ Increment total applicants count
    const { error: updateError } = await supabase.rpc("increment_applicants", {
      job_id: job.id,
    });
    if (updateError) throw updateError;

    // 3️⃣ Get resume text from PDF file
    let resumeText = "";
    try {
      // Get the filename from the URL
      const fileName = resumeFileUrl.split("/").pop();
      if (!fileName) {
        throw new Error("Invalid resume file URL");
      }

      // Download the file from Supabase storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("resumes")
        .download(fileName);

      if (downloadError) {
        throw downloadError;
      }

      if (!fileData) {
        throw new Error("No file data received");
      }

      // Convert Blob to Buffer
      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Parse PDF
      const pdfData = await pdf(buffer);

      if (!pdfData || typeof pdfData.text !== "string") {
        throw new Error("Invalid PDF text extraction result");
      }

      // Clean and validate the extracted text
      resumeText = pdfData.text.toString().trim();

      if (!resumeText) {
        console.warn("Warning: Extracted PDF text is empty");
      }

      console.log(
        "Successfully extracted text from PDF, length:",
        resumeText.length
      );
    } catch (error) {
      console.error("Error in PDF processing:", error);
      resumeText = "";
    }

    // 4️⃣ AI parsing and analysis
    let formData;
    try {
      // Parse the raw form data if it's a string, otherwise use as is
      formData = typeof rawData === "string" ? JSON.parse(rawData) : rawData;

      // Validate the parsed data is an object
      if (!formData || typeof formData !== "object") {
        throw new Error("Invalid form data format");
      }
    } catch (error) {
      console.error("Error parsing form data:", error);
      formData = {};
    }

    // Validate and clean resume text
    const cleanedResumeText =
      typeof resumeText === "string" ? resumeText.trim() : "";
    if (!cleanedResumeText) {
      console.warn("Warning: Resume text is empty or invalid");
    }

    console.log("Sending data to AI analysis:", {
      applicationId: application.id,
      jobId: job.id,
      hasResumeText: Boolean(cleanedResumeText),
      resumeLength: cleanedResumeText.length,
      formDataKeys: Object.keys(formData),
    });

    // Call AI analysis with required data
    const structured = analyzeApplicationAI(
      application.id,
      job.job_description,
      job.title,
      job.company_name,
      {
        resumeText: cleanedResumeText,
        formData: formData,
      }
    );

    return res.status(201).json({ application });
  } catch (error: any) {
    console.error("Error submitting application:", error.message || error);
    return res.status(500).json({ error: "Failed to submit application" });
  }
};

// -------------------------------
// Get Application by ID
// -------------------------------
export const getApplicationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clientId = req.user?.id;

    const { data, error } = await supabase
      .from("applications")
      .select("*, jobs!inner(client_id), structured_applications(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Application not found" });

    if (data.jobs.client_id !== clientId) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this application" });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Error getting application:", error.message || error);
    return res.status(500).json({ error: "Failed to get application" });
  }
};

// -------------------------------
// List Applications
// -------------------------------
export const listApplications = async (req: Request, res: Response) => {
  try {
    const { jobId, verdict, page = 1, limit = 10 } = req.query;
    const clientId = req.user?.id;

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase
      .from("applications")
      .select("*, jobs!inner(client_id), structured_applications(*)", {
        count: "exact",
      })
      .order("submitted_at", { ascending: false })
      .range(from, to);

    if (jobId) query = query.eq("job_id", jobId as string);
    if (verdict)
      query = query.eq("structured_applications.verdict", verdict as string);
    query = query.eq("jobs.client_id", clientId);

    const { data, error, count } = await query;
    if (error) throw error;

    return res.status(200).json({
      data,
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil((count || 0) / Number(limit)),
    });
  } catch (error: any) {
    console.error("Error listing applications:", error.message || error);
    return res.status(500).json({ error: "Failed to list applications" });
  }
};

// -------------------------------
// Update Structured Application (manual override)
// -------------------------------
export const updateStructuredApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    const clientId = req.user?.id;

    // Check ownership
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, jobs!inner(client_id)")
      .eq("id", id)
      .single();

    if (appError) throw appError;
    if (!application)
      return res.status(404).json({ error: "Application not found" });
    if (application.jobs[0].client_id !== clientId)
      return res.status(403).json({ error: "Not authorized" });

    // Remove protected fields
    delete updates.id;
    delete updates.application_id;
    delete updates.parsed_at;

    if (updates.verdict && !Object.values(Verdict).includes(updates.verdict)) {
      return res.status(400).json({ error: "Invalid verdict value" });
    }

    const { data, error } = await supabase
      .from("structured_applications")
      .update(updates)
      .eq("application_id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data)
      return res
        .status(404)
        .json({ error: "Structured application not found" });

    return res.status(200).json(data);
  } catch (error: any) {
    console.error(
      "Error updating structured application:",
      error.message || error
    );
    return res
      .status(500)
      .json({ error: "Failed to update structured application" });
  }
};
