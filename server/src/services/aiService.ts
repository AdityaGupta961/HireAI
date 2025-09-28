import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { supabase } from "../lib/supabaseClient";
import { Verdict } from "../models/enums";

// Initialize LLM client
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-pro",
  temperature: 0,
  apiKey: process.env.GEMINI_API_KEY!,
});

// Initialize embeddings client
const embeddingsClient = new GoogleGenerativeAIEmbeddings({
  modelName: "embedding-001",
  apiKey: process.env.GEMINI_API_KEY!,
});

// Generate embedding
export const generateEmbedding = async (text: string): Promise<number[]> => {
  const embedding = await embeddingsClient.embedQuery(text);
  return embedding;
};

// AI parses resume and returns metrics, verdict, justification, score
export const parseAndScoreResume = async (
  resumeText: string,
  job_description: string,
  title: string,
  company_name: string
) => {
  // Validate and clean input
  if (typeof resumeText !== "string") {
    console.error("Invalid resume text type:", typeof resumeText);
    resumeText = "";
  }

  const cleanText = resumeText.trim();
  if (!cleanText) {
    console.warn("Empty resume text provided to AI analysis");
  }

  const prompt = `
You are an expert AI assistant for hiring.
Analyze the following resume text and extract structured information about the candidate.
Then you must provide a score from 0-100, a verdict, and justification for the verdict based on how well the candidate matches the job description.
The job is for a position at ${company_name} titled "${title}". The job description is as follows: ${job_description}
Your output MUST be valid JSON with these keys:
{
  "full_name": string,
  "email": string,
  "skills": string[],
  "metrics": { "skill_match": number, "experience_match": number, "other_relevant_metrics": any },
  "score": number,  // AI ranking 0-100
  "verdict": "accepted" | "rejected" | "needs_review",
  "justification": string
}
Be concise, accurate, realistic, and consistent.
If the resume text is empty, reflect that in your analysis.

Resume Text: """${cleanText}"""
`;

  const responseRaw = await llm.invoke(prompt);
  const responseText = responseRaw.text;
  console.log("AI Raw Response:", responseText);

  // Try to find JSON in the response text
  let jsonMatch = responseText.match(/\{[\s\S]*\}/);
  let structured: any = {};

  try {
    if (jsonMatch) {
      structured = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("No JSON found in response");
    }

    // Validate the parsed structure
    if (
      !structured.full_name ||
      !structured.email ||
      !Array.isArray(structured.skills)
    ) {
      throw new Error("Invalid response structure");
    }
  } catch (parseError: any) {
    console.warn(
      "Failed to parse AI output:",
      parseError?.message || "Unknown error"
    );
    console.log("Raw response text:", responseText);

    structured = {
      full_name: "",
      email: "",
      skills: [],
      metrics: { skill_match: 0, experience_match: 0 },
      score: 0,
      verdict: "needs_review" as Verdict,
      justification: `AI couldn't read the resume properly. ${
        structured.justification || ""
      }`,
    };
  }

  // Generate embedding for semantic search
  //const embedding = await generateEmbedding(resumeText);

  return {
    ...structured,
    resume_text: resumeText,
    //embedding
  };
};

// Save structured application to Supabase
export const saveStructuredApplication = async (
  applicationId: string,
  parsed: any
) => {
  const { data, error } = await supabase
    .from("structured_applications")
    .insert([
      {
        application_id: applicationId,
        full_name: parsed.full_name,
        email: parsed.email,
        skills: parsed.skills,
        resume_text: parsed.resume_text,
        score: parsed.score,
        verdict: parsed.verdict,
        metrics: parsed.metrics,
        justification: parsed.justification,
        //embedding: parsed.embedding
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Wrapper for controller
export const analyzeApplicationAI = async (
  applicationId: string,
  job_description: string,
  title: string,
  company_name: string,
  data: { resumeText: string; [key: string]: any }
) => {
  // Extract and validate resume text
  const resumeText = typeof data.resumeText === "string" ? data.resumeText : "";
  if (!resumeText) {
    console.warn("Warning: Empty resume text received by AI service");
  }

  const parsed = await parseAndScoreResume(
    resumeText,
    job_description,
    title,
    company_name
  );
  const saved = await saveStructuredApplication(applicationId, parsed);
  return saved;
};
