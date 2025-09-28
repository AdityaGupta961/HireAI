export interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
}

export interface JobMetrics {
  accepted: number;
  rejected: number;
  needs_review: number;
  avg_score: number;
  avg_skill_match: number;
  avg_experience_match: number;
  total: number;
}

export interface Job {
  id: string;
  client_id: string;
  title: string;
  company_name: string;
  job_description: string;
  location?: string;
  shareable_link?: string;
  status?: "open" | "closed";
  total_applicants?: number;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
  aiMetrics?: JobMetrics;
}

export interface StructuredApplication {
  id: string;
  application_id: string;
  full_name: string;
  email: string;
  skills: string[];
  resume_text: string;
  score: number; // AI ranking 0-1
  verdict: "accepted" | "rejected" | "needs_review";
  metrics: {
    skill_match?: number;
    experience_match?: number;
    [key: string]: any;
  };
  justification: string;
  embedding: number[];
  parsed_at?: string;
}

export interface Application {
  id: string;
  job_id: string;
  raw_data: string;
  resume_file_url: string;
  submitted_at?: string;
  structured_applications?: StructuredApplication;
}
