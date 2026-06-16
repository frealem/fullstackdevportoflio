export interface Profile {
  name: string;
  title: string;
  email: string;
  github: string;
  linkedin: string;
  bio: string;
  detailedBio: string;
  location: string;
  education: string;
  avatarUrl?: string;
  resumeDownloadUrl?: string;
  skills: {
    frontend: string[];
    backend: string[];
    database: string[];
    devops: string[];
    languages: string[];
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  category: "fullstack" | "frontend" | "backend";
  githubUrl?: string;
  liveUrl?: string;
  iconName: string; // Lucide icon reference
  interactiveSandboxType?: "api_simulator" | "regex_tester" | "sql_query_filter";
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "remote" | "onsite";
  source: string;
  salary: string;
  level: string;
  description: string;
  requirements: string[];
  safeCheck: {
    isSafe: boolean;
    reasoning: string;
    trustScore: number;
  };
  skillsRecommended: string[];
  applicationTips: string;
}

export interface ClientInquiry {
  id: string;
  clientName: string;
  companyName: string;
  clientEmail: string;
  projectDescription: string;
  projectType: string;
  budgetRange: string;
  dateSubmitted: string;
  status: "new" | "replied" | "archived";
}

export interface AppliedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  dateApplied: string;
  status: "to_apply" | "applied" | "interviewing" | "offer" | "archived";
  notes?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // percentage 0-100
}

