import { Request, Response } from "express";
import { supabase } from "../lib/supabaseClient";
import { Status } from "../models/enums";
import { randomUUID } from "crypto";

// -------------------------------
// Create a new Job
// -------------------------------
export const create = async (req: Request, res: Response) => {
  try {
    const { clientId, title, companyName, jobDescription, location, expiresAt } =
      req.body;

    if (!clientId || !title || !companyName || !jobDescription) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const jobId = randomUUID();
    const shareableLink = `job-${jobId}`;

    const { data, error } = await supabase
      .from("jobs")
      .insert([
        {
          id: jobId,
          client_id: clientId,
          title,
          company_name: companyName,
          job_description: jobDescription,
          location,
          shareable_link: shareableLink,
          status: Status.OPEN,
          total_applicants: 0,
          expires_at: expiresAt || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    console.error("Error creating job:", error.message || error);
    return res.status(500).json({ error: "Failed to create job" });
  }
};

// -------------------------------
// Get Job by ID or Shareable Link
// -------------------------------
export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("shareable_link", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Job not found" });

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Error getting job:", error.message || error);
    return res.status(500).json({ error: "Failed to get job" });
  }
};

// -------------------------------
// Update Job
// -------------------------------
export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { clientId, title, companyName, jobDescription, location, expiresAt } =
      req.body;

    if (!clientId || !title || !companyName || !jobDescription) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("jobs")
      .update({
        title,
        company_name: companyName,
        job_description: jobDescription,
        location,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Job not found" });

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Error updating job:", error.message || error);
    return res.status(500).json({ error: "Failed to update job" });
  }
};

// -------------------------------
// Delete Job
// -------------------------------
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) throw error;

    return res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting job:", error.message || error);
    return res.status(500).json({ error: "Failed to delete job" });
  }
};

// -------------------------------
// List Jobs (with pagination + filters + AI metrics)
// -------------------------------
export const listJobs = async (req: Request, res: Response) => {
  try {
    const { clientId, status, page = 1, limit = 10 } = req.query;

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    // Fetch jobs with filters and exact count
    let jobsQuery = supabase
      .from("jobs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (clientId) jobsQuery = jobsQuery.eq("client_id", clientId as string);
    if (status) jobsQuery = jobsQuery.eq("status", status as string);

    const { data: jobs, error: jobsError, count } = await jobsQuery;
    if (jobsError) throw jobsError;

    if (!jobs || jobs.length === 0) {
      return res.status(200).json({
        data: [],
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil((count || 0) / Number(limit)),
      });
    }

    // Fetch aggregated AI metrics per job
    const jobIds = jobs.map((j: any) => j.id);
    const { data: metricsData, error: metricsError } = await supabase.rpc(
      "get_job_ai_metrics",
      { job_ids: jobIds }
    );
    if (metricsError) throw metricsError;

    const metricsMap: Record<string, any> = {};
    metricsData?.forEach((m: any) => {
      metricsMap[m.job_id] = m;
    });

    const jobsWithMetrics = jobs.map((job: any) => ({
      ...job,
      aiMetrics: metricsMap[job.id] || {
        accepted: 0,
        rejected: 0,
        needs_review: 0,
        avg_score: 0,
        avg_skill_match: 0,
        avg_experience_match: 0,
        total: 0,
      },
    }));

    return res.status(200).json({
      data: jobsWithMetrics,
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil((count || 0) / Number(limit)),
    });
  } catch (error: any) {
    console.error("Error listing jobs:", error.message || error);
    return res.status(500).json({ error: "Failed to list jobs" });
  }
};
