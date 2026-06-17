import { Profile, Project } from "./types";

export const DEFAULT_PROFILE: Profile = {
  name: "Frealem Tekalign",
  title: "Full-Stack Software Engineer & AI Prompt Engineer",
  email: "frealem.tekalign.dev@gmail.com",
  github: "github.com/frealem-tekalign",
  linkedin: "linkedin.com/in/frealemtekalign",
  location: "Addis Ababa, Ethiopia (Open to Remote Worldwide / Onsite Local)",
  education: "B.Sc. in Software Engineering, Addis Ababa University (AAU)",
  bio: "Full-Stack Software Engineer specializing in high-performance frontend engineering (MERN Stack, React, TypeScript, Tailwind CSS) & robust, high-fidelity backends (Node.js Express, Python FastAPI, PostgreSQL). Dynamic AI Prompt Engineer experienced in structuring high-fidelity LLM response chains and prompt tuning.",
  detailedBio: "I am a Software Engineering graduate from Addis Ababa University focused on engineering durable developer platforms and robust client integrations. I specialize in building type-safe frontends using React JS, TypeScript, and Tailwind CSS. On the backend, I design optimized RESTful / JSON APIs and asynchronous task workflows with Node.js Express, MERN, and Python FastAPI. I am also an expert AI Prompt Engineer, tuning model integrations that produce deterministic multi-tenant data logs across local and worldwide environments.",
  skills: {
    frontend: ["React JS (18/19)", "TypeScript", "Tailwind CSS v4", "Recharts & D3.js Charts", "Vite Bundler Optimization", "Framer Motion", "Next.js", "MERN Stack UI"],
    backend: ["Node.js Express", "Python FastAPI", "RESTful / JSON APIs", "asynchronous tasks (Celery/Queues)", "Go (Golang) Microservices", "WebSockets Logs", "Express.js Controllers"],
    database: ["PostgreSQL (Drizzle & Prisma)", "MongoDB / Mongoose", "Redis Memory Cache", "Firebase Firestore", "SQL Database Tuning"],
    devops: ["Docker Containerization", "GitHub Actions CI/CD", "Nginx Reverse Proxying", "Linux Bash Scripting", "AWS S3 / EC2 Setup"],
    languages: ["Amharic (Native)", "English (Professional Fluent / Asynchronous Teams)"]
  }
};

export const PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "OmniPay East Africa Gateway",
    description: "High-performance mock payment aggregator API simulating direct Telebirr, Chapa, and CBE Birr integrations with atomic ledgers and dashboard controls.",
    longDescription: "OmniPay bridges the integration gap for global and local merchants in Ethiopia. Designed using a modular C4 architecture, it features a RESTful API with automated webhook dispatches, high-throughput debit ledgers, and a comprehensive Vite client dashboard tracking success ratios, transaction latencies, and transaction volumes via fluid charts.",
    tags: ["React 19", "Node.js", "Express", "PostgreSQL", "Recharts"],
    category: "fullstack",
    githubUrl: "https://github.com/frealem-tekalign/omnipay-gateway",
    liveUrl: "https://omnipay-east-africa.dev",
    iconName: "CreditCard",
    interactiveSandboxType: "api_simulator",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "proj-2",
    title: "VeloSync Router / Log Orchestrator",
    description: "Universal structured logging, rate limiter, and regex filter pipeline configured for clean Kubernetes ingress routing and latency debugging.",
    longDescription: "An internal developer middleware utility engineered in Go and exported as a Docker container. It processes inbound Nginx logs, applies custom regex rules in under 100 microseconds, caches route permissions in Redis, and exports structured telemetry directly to localized web dashboards. Helps developers debug live microservice communication anomalies instantly.",
    tags: ["Go (Golang)", "Redis", "Regex Sandbox", "Docker", "Tailwind CSS"],
    category: "backend",
    githubUrl: "https://github.com/frealem-tekalign/velosync-router",
    liveUrl: "https://velosync-logs.dev",
    iconName: "Cpu",
    interactiveSandboxType: "regex_tester",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "proj-3",
    title: "Alem Multi-Tenant CMS Core",
    description: "Sleek, database-driven headless content CMS featuring virtual tables, schema relationships, and live query output testing dashboard.",
    longDescription: "Alem CMS lets local Ethiopian content publishers support multi-language localizations (Amharic, Afaan Oromoo, English) seamlessly out-of-the-box. It exposes an relational metadata schema builder where teams can configure virtual fields and instantly retrieve them via a GraphQL parser, optimized with Redis caching.",
    tags: ["TypeScript", "Next.js", "GraphQL", "Redis", "SQL Studio"],
    category: "frontend",
    githubUrl: "https://github.com/frealem-tekalign/alem-cms",
    liveUrl: "https://alem-cms.dev",
    iconName: "Database",
    interactiveSandboxType: "sql_query_filter",
    imageUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80"
  }
];
