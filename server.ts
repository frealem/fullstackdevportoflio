import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Curated beautiful fallback jobs representing LinkedIn, Afriwork, Ethiojobs, Effoyjobs, and high-payout Remote Portals
const FALLBACK_JOBS = [
  {
    id: "live-1",
    title: "Frontend Engineer (React & TypeScript Expert)",
    company: "iCog Labs (via Afriwork)",
    location: "Addis Ababa, Ethiopia (Hybrid / Bole Workspace)",
    type: "onsite",
    source: "https://t.me/afriwork",
    salary: "35,000 - 55,000 ETB / month",
    level: "Junior-Intermediate",
    description: "Build interactive browser frontends and custom dashboard systems for global AI projects. We thrive on clean React architectures, responsive CSS frames, and type-safe state routing.",
    requirements: [
      "B.Sc in Software Engineering (Addis Ababa University AAU grads highly preferred).",
      "Solid understanding of React JS, TypeScript, Tailwind CSS, and Vite setups.",
      "Experience integrating rest endpoints and working within modern Agile sprint pipelines."
    ],
    safeCheck: {
      isSafe: true,
      reasoning: "Verified Afriwork partner role with physical presence in Addis Ababa, Bole. Guaranteed direct contract without agency placement fees.",
      trustScore: 99
    },
    skillsRecommended: ["React JS", "TypeScript", "Tailwind CSS", "RESTful APIs"],
    applicationTips: "Ensure your portfolio is clean, interactive, and clearly highlights real-world functional modules rather than default templates."
  },
  {
    id: "live-2",
    title: "Full-Stack Software Engineer (React / Python FastAPI)",
    company: "Commercial Bank of Ethiopia (via Ethiojobs)",
    location: "Addis Ababa, Ethiopia (Onsite / Digital Labs HQ)",
    type: "onsite",
    source: "https://www.ethiojobs.net",
    salary: "65,000 - 85,000 ETB / month",
    level: "Intermediate",
    description: "Develop, secure, and monitor large-scale internal middleware and consumer-facing finance gateways using React JS, Node.js Express, and Python FastAPI.",
    requirements: [
      "2-4 years of active developer experience in web applications.",
      "Thorough understanding of relational SQL databases (PostgreSQL/Oracle), indexes, and migrations.",
      "Experience with API security criteria, proxy routers, and token rotation workflows."
    ],
    safeCheck: {
      isSafe: true,
      reasoning: "State-backed financial hub listing on verified Ethiojobs recruiter framework. High job security.",
      trustScore: 100
    },
    skillsRecommended: ["Python FastAPI", "Node.js Express", "React JS", "PostgreSQL"],
    applicationTips: "Highlight database optimization, secure schema design, and asynchronous webhook handling in your custom toolkits."
  },
  {
    id: "live-3",
    title: "Junior to Intermediate Microservice Dev (Node.js)",
    company: "Chapa Technologies (via Effoyjobs)",
    location: "Bole, Addis Ababa, Ethiopia (Onsite)",
    type: "onsite",
    source: "https://effoyjobs.com",
    salary: "50,000 - 75,000 ETB / month",
    level: "Junior/Intermediate",
    description: "Help build and optimize payment checkout plugins, dashboard analytics interfaces, and low-latency API wrappers using Express.js and Vite React.",
    requirements: [
      "1.5+ years of software development experience.",
      "Strong skills in modern Node.js backend controllers and Tailwind grids.",
      "Familiarity with webhook architectures, payment settlement flows, and JWT authentication."
    ],
    safeCheck: {
      isSafe: true,
      reasoning: "Prominent licensed payment solutions provider in Ethiopia. Secure onsite office environment.",
      trustScore: 98
    },
    skillsRecommended: ["Node.js Express", "React JS", "API Integrations", "Tailwind CSS"],
    applicationTips: "Demo an dynamic project containing mock payment gateways, validation overlays, or latency analysis logs."
  },
  {
    id: "live-4",
    title: "Remote Web Integrator & AI Prompt Engineer",
    company: "Axiom Digital LLC (via LinkedIn)",
    location: "Remote (Worldwide / Async Flexible)",
    type: "remote",
    source: "https://www.linkedin.com/jobs",
    salary: "$3,500 - $5,000 USD / month (Direct Wire / Payoneer / P2P)",
    level: "Intermediate",
    description: "Implement interactive web clients in React and engineer structured JSON prompt pipelines for custom LLM flows. We support prompt tuning, structured output schemas, and low-latency cache wrappers.",
    requirements: [
      "2.5+ years of professional development with TypeScript / React JS.",
      "Practical experience structuring Gemini / OpenAI model prompts to output strict deterministic JSON structures.",
      "Capable of managing secure server-side proxy routers to shield sensitive external API tokens."
    ],
    safeCheck: {
      isSafe: true,
      reasoning: "Verified hiring company page with active LinkedIn presence. Payouts processed securely via international Payoneer, direct Bank Wire, or secure stablecoins.",
      trustScore: 97
    },
    skillsRecommended: ["React JS", "TypeScript", "AI Prompt Engineering", "Python FastAPI", "Payoneer Payouts"],
    applicationTips: "Provide clear snippets showing prompts you designed that successfully return standard JSON patterns without formatting markdown backticks."
  },
  {
    id: "live-5",
    title: "Remote Frontend Specialist (TypeScript & Tailwind)",
    company: "Clipboard Scale (via RemoteOk & LinkedIn)",
    location: "Remote (Global / EMEA Candidates Welcome)",
    type: "remote",
    source: "https://www.linkedin.com/jobs",
    salary: "$4,000 - $6,000 USD / month (Payoneer / Wise / Bank Wire)",
    level: "Intermediate",
    description: "Maintain and polish dynamic dashboard states, visual bento grids, and high-frequency analytics charts. We work in the EMEA timezone and support flexible hours.",
    requirements: [
      "3+ years of professional frontend engineering in TypeScript, React, and Tailwind CSS.",
      "Substantial knowledge of browser reflow, layout optimizations, and loading transitions.",
      "Comfortable with async handoffs, daily Slack syncs, and clear Git histories."
    ],
    safeCheck: {
      isSafe: true,
      reasoning: "Established company with stellar glassdoor score and zero history of payment default or layout contract scams.",
      trustScore: 96
    },
    skillsRecommended: ["React JS", "TypeScript", "Tailwind CSS v4", "Vite Bundlers"],
    applicationTips: "Showcase an elegant dashboard project utilizing clean, high-contrast typography, spacing hierarchy, and dense interactive tables."
  },
  {
    id: "live-6",
    title: "Remote Backend API Engineer (Python FastAPI / Node)",
    company: "Lano Compliance (via Technical Careers)",
    location: "Remote (Worldwide / Africa Regions Supported)",
    type: "remote",
    source: "https://lano.io/careers",
    salary: "$5,000 - $7,000 USD / month (Direct Wire / Payoneer / P2P Payouts)",
    level: "Intermediate",
    description: "Engineer compliance engines, multi-currency invoicing pipelines, and asynchronous webhook dispatch systems using Python FastAPI and Node.js.",
    requirements: [
      "3+ years of professional backend experience.",
      "Strong Postgres normal forms design, query debugging, and migration indexing.",
      "Experience with automated code verification and secure cloud containerization (Docker)."
    ],
    safeCheck: {
      isSafe: true,
      reasoning: "Growing European remote-first payroll aggregator. Standard onboarding documentation, automated contracting, and premium wire transfers.",
      trustScore: 98
    },
    skillsRecommended: ["Python FastAPI", "Node.js Express", "PostgreSQL", "Docker", "Wire Transfers"],
    applicationTips: "Be ready to demonstrate deep knowledge of relational ACID transactions. Highlight custom REST architecture."
  }
];

// Shared in-memory portfolio showcases store for dynamic real-time administrative updates
const DEFAULT_PROJECTS = [
  {
    id: "proj-1",
    title: "OmniPay East Africa Gateway",
    description: "High-performance payment aggregator API simulating direct Telebirr, CBE Birr, and Chapa integrations with atomic ledgers.",
    longDescription: "OmniPay solves local fintech gateway routing challenges in East Africa. Architected in Node.js Express, it features custom webhook retry queues, atomic database ledgers, and a comprehensive real-time dashboard written in React with fluid Recharts visualizations detailing transaction throughput under 50ms latency.",
    tags: ["React JS", "TypeScript", "Node.js Express", "PostgreSQL", "Recharts"],
    category: "fullstack",
    githubUrl: "https://github.com/frealem-tekalign/omnipay-gateway",
    liveUrl: "https://omnipay-east-africa.dev",
    iconName: "CreditCard",
    interactiveSandboxType: "api_simulator"
  },
  {
    id: "proj-2",
    title: "VeloSync Router & Log Orchestrator",
    description: "Universal security proxy, rate limiter, and regex log parser optimized for high-speed local ingress routing.",
    longDescription: "A high-performance lightweight service developed in Python FastAPI and Node.js. It acts as an active ingress proxy logging middleware that filters malicious SQL or injection payloads in under 150 microseconds, caches IP rate-limits inside Redis, and exposes log streaming interfaces to let developers debug complex APIs seamlessly.",
    tags: ["Python FastAPI", "Node.js Express", "Redis", "Docker", "Regex Sandbox"],
    category: "backend",
    githubUrl: "https://github.com/frealem-tekalign/velosync-router",
    liveUrl: "https://velosync-logs.dev",
    iconName: "Cpu",
    interactiveSandboxType: "regex_tester"
  },
  {
    id: "proj-3",
    title: "Alem Multi-Language CMS Studio",
    description: "Database-driven multi-tenant headless content system featuring virtual schema builder and localized web dashboard.",
    longDescription: "Alem CMS is an open-source headless content framework designed for Ethiopian publishers. It natively compiles multi-language localizations (Amharic, Afaan Oromoo, and English) out-of-the-box. Developers can build customizable tables, connect complex relations, and query results in real time with a clean visual SQL playground.",
    tags: ["React JS", "TypeScript", "Tailwind CSS", "SQL Studio", "JSON Builder"],
    category: "frontend",
    githubUrl: "https://github.com/frealem-tekalign/alem-cms",
    liveUrl: "https://alem-cms.dev",
    iconName: "Database",
    interactiveSandboxType: "sql_query_filter"
  }
];

let SERVER_PROJECTS = [...DEFAULT_PROJECTS];

const DEFAULT_SKILLS = [
  { id: "skill-1", name: "TypeScript & React", level: 95 },
  { id: "skill-2", name: "Go / Golang Node Backend", level: 88 },
  { id: "skill-3", name: "SQL Postgres & Drizzle", level: 86 },
  { id: "skill-4", name: "Docker Ingress Pipeline", level: 80 }
];

let SERVER_SKILLS = [...DEFAULT_SKILLS];

const DEFAULT_PROFILE_V2 = {
  name: "Frealem Tekalign",
  title: "Full-Stack Software Engineer & AI Prompt Engineer",
  email: "frealem.tekalign.dev@gmail.com",
  github: "github.com/frealem-tekalign",
  linkedin: "linkedin.com/in/frealemtekalign",
  upwork: "www.upwork.com/freelancers/~01a58722532efa8600?mp_source=share",
  telegram: "t.me/frealem",
  customSocialLabel: "Twitter",
  customSocialUrl: "twitter.com/frealem",
  location: "Addis Ababa, Ethiopia (Open to Remote Worldwide / Onsite Local)",
  education: "B.Sc. in Software Engineering, Addis Ababa University (AAU)",
  bio: "Full-Stack Software Engineer specializing in high-performance frontend engineering (MERN Stack, React, TypeScript, Tailwind CSS) & robust, high-fidelity backends (Node.js Express, Python FastAPI, PostgreSQL). Dynamic AI Prompt Engineer experienced in structuring high-fidelity LLM response chains and prompt tuning."
};

let SERVER_PROFILE = { ...DEFAULT_PROFILE_V2 };



async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Shared lazy init helper for Gemini SDK
  let geminiAI: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!geminiAI) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
        geminiAI = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
      }
    }
    return geminiAI;
  }

  // API 1: Fetch and search latest jobs using search grounding
  app.get("/api/jobs", async (req, res) => {
    try {
      const client = getGeminiClient();
      if (!client) {
        console.warn("GEMINI_API_KEY is not configured or placeholder. Delivering curated live fallback jobs.");
        return res.json({ jobs: FALLBACK_JOBS, grounded: false });
      }

      console.log("Fetching live jobs via Gemini search grounding...");
      const prompt = `
        Search and find 6-8 genuine, high-quality, currently active (or highly realistic ongoing) developer/full-stack engineer job vacancies.
        The selected vacancies MUST belong strictly to two categories:
        Category A: 100% remote software developer/full-stack jobs open to worldwide candidates (no regional blocking, legimate non-scam).
        Category B: Onsite or hybrid developer/full-stack jobs located in Addis Ababa, Ethiopia, requiring up to intermediate developers (1-4 years of experience).

        Format the response STRICTLY as a JSON object with a single root key 'jobs', which contains an array of job objects.
        Each job object must follow this typescript structure:
        {
          id: string; // unique short ID (e.g. 'live-1', 'live-2')
          title: string; // role name
          company: string; // hiring company name
          location: string; // city, country and/or Remote
          type: "remote" | "onsite";
          source: string; // genuine application URL or career site URL
          salary: string; // realistic salary range in USD (for remote) or ETB (for Ethiopian onsite)
          level: string; // e.g. "Intermediate", "Junior/Intermediate"
          description: string; // short summary of the role
          requirements: string[]; // 3-5 solid requirements
          safeCheck: {
            isSafe: boolean; // analyze if there are scam flags, verify authenticity
            reasoning: string; // brief human-like safety reasoning
            trustScore: number; // integer 0-100 indicating confidence
          };
          skillsRecommended: string[]; // 4-5 core tech stack keywords
          applicationTips: string; // targeted, brief, actionable tip to land this role
        }

        Make sure the jobs represent real developer opportunities from legitimate platforms like DevIT, Gebeya, Safaricom, Ethiojobs, LinkedIn, Remote Ok, or Chapa. Maintain outstanding formatting.
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite, trusted software developer recruitment analyst. Filter out all low-quality agency ads, scam remote schemes, fee-based listings, and ghost jobs. Ensure perfect safety verification. Return ONLY standard valid JSON without markdown layout blocks around it.",
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "";
      const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(cleaned);

      if (parsed && Array.isArray(parsed.jobs) && parsed.jobs.length > 0) {
        return res.json({ jobs: parsed.jobs, grounded: true });
      }

      console.warn("Invalid parser structure or empty job array, falling back to curated stack.");
      return res.json({ jobs: FALLBACK_JOBS, grounded: false });
    } catch (err: any) {
      console.error("Error generating grounded jobs feed: ", err.message);
      return res.json({ jobs: FALLBACK_JOBS, grounded: false, error: err.message });
    }
  });

  // API 2: AI Cover Letter Customizer & Resume Advisor
  app.post("/api/tailor", async (req, res) => {
    try {
      const { jobTitle, company, description, cvData } = req.body;
      const client = getGeminiClient();

      if (!client) {
        // High quality fallback generation if key is missing
        const fallbackAdvising = {
          coverLetter: `Dear Hiring Team at ${company || "Target Company"},\n\nI am writing to express my strong interest in the ${jobTitle || "Full Stack Developer"} position. As an Ethio-centric Full-Stack Engineer with deep expertise building high-performance modules using React, TypeScript, and Node.js, I thrive at the intersection of robust backend engines and clean, intuitive user interfaces.\n\nYour mandate for building highly scalable code matches perfectly with my project showcase. For instance, my custom-built API Orchestrator and interactive React Dashboards emphasize layout performance and complete data integration. Whether working onsite in Addis Ababa or building asynchronously with a distributed international team remote, I provide speed, security, and a relentless focus on client goals.\n\nThank you for your time and consideration. I look forward to detailing how my technical foundation can deliver immediate results.\n\nSincerely,\nEthiopian Full-Stack Developer`,
          adjustments: [
            "Highlight complete, standalone projects in React + Tailwind on your first page.",
            "Incorporate a 'Databases' sub-section highlighting Postgres or MongoDB schema design.",
            `Ensure you mention direct API proxy integrations under your projects to show complete client-to-server understanding, matching the criteria of ${company || "the company"}.`,
            "Quantify your load optimizations (e.g., 'optimized image asset rendering in React by 40%').",
            "State explicitly: 'Comfortable working both in local hybrid Addis Ababa setups and globally async remote pipelines'."
          ],
          interviewPrep: [
            {
              question: "How do you handle database migration security and API key parameters in dynamic environments?",
              bestAnswer: "Explain that you utilize server-side API proxy routers (/api/*) so secrets never leak to Vite/client bundles, and structure DBM files sequentially via raw migrations or ORM schemas."
            },
            {
              question: "What is your experience working in multi-timezone teams?",
              bestAnswer: "Focus on clear documentation, atomic commits, proactive daily Slack/Discord briefs, and using tools like Figma and Postman to minimize handoff friction."
            }
          ]
        };
        return res.json(fallbackAdvising);
      }

      const prompt = `
        Analyze this candidate profile against the target job listing:
        Target Company: ${company}
        Job Title: ${jobTitle}
        Job Description: ${description}

        Candidate Technical Profile:
        ${JSON.stringify(cvData || {})}

        Write (1) An extremely compelling, professional, non-generic Cover Letter.
        (2) Five highly specific, surgical adjustements the candidate should make to their CV / portfolio to pass the screening.
        (3) Two likely interview technical or behavioral questions tailored to this role and the candidate, with advice on the Best Answer strategies.

        Format response STRICTLY as a JSON object of this design:
        {
          "coverLetter": "string content with proper newlines",
          "adjustments": ["advise 1", "advise 2", "advise 3", "advise 4", "advise 5"],
          "interviewPrep": [
            { "question": "q1", "bestAnswer": "answer advice 1" },
            { "question": "q2", "bestAnswer": "answer advice 2" }
          ]
        }
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite talent coach and expert IT recruiter. Generate persuasive and targeted materials that have zero boilerplate and read with high energy, confidence, and impeccable professional tone.",
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "";
      const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      const jobTailored = JSON.parse(cleaned);
      return res.json(jobTailored);
    } catch (err: any) {
      console.error("Tailor request error: ", err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // API 3: Get current dynamic project showcases
  app.get("/api/projects", (req, res) => {
    return res.json({ projects: SERVER_PROJECTS });
  });

  // API 4: Add or update a project showcase
  app.post("/api/projects", (req, res) => {
    try {
      const { id, title, description, longDescription, tags, category, githubUrl, liveUrl, iconName, interactiveSandboxType } = req.body;
      
      if (!title || !description || !category) {
        return res.status(400).json({ error: "Missing required fields: title, description, and category are required." });
      }

      const cleanTags = Array.isArray(tags)
        ? tags
        : String(tags || "").split(",").map(t => t.trim()).filter(Boolean);

      if (id) {
        const idx = SERVER_PROJECTS.findIndex(p => p.id === id);
        if (idx !== -1) {
          SERVER_PROJECTS[idx] = {
            id,
            title,
            description,
            longDescription: longDescription || description,
            tags: cleanTags,
            category: category as any,
            githubUrl: githubUrl || "",
            liveUrl: liveUrl || "",
            iconName: iconName || "Layers",
            interactiveSandboxType: interactiveSandboxType || undefined
          };
          return res.json({ success: true, message: "Showcase updated successfully on the server!", project: SERVER_PROJECTS[idx] });
        }
      }

      // Create new
      const newId = `proj-${Date.now()}`;
      const newProj = {
        id: newId,
        title,
        description,
        longDescription: longDescription || description,
        tags: cleanTags,
        category: category as any,
        githubUrl: githubUrl || "",
        liveUrl: liveUrl || "",
        iconName: iconName || "Layers",
        interactiveSandboxType: interactiveSandboxType || undefined
      };
      SERVER_PROJECTS.push(newProj);
      return res.json({ success: true, message: "New showcase added successfully on the server!", project: newProj });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // API 4a: Get dynamic profile details
  app.get("/api/profile", (req, res) => {
    return res.json({ profile: SERVER_PROFILE });
  });

  // API 4b: Update dynamic profile details
  app.post("/api/profile", (req, res) => {
    try {
      const {
        name,
        title,
        email,
        github,
        linkedin,
        upwork,
        telegram,
        customSocialLabel,
        customSocialUrl,
        location,
        education,
        bio
      } = req.body;

      SERVER_PROFILE = {
        name: name || SERVER_PROFILE.name,
        title: title || SERVER_PROFILE.title,
        email: email || SERVER_PROFILE.email,
        github: github || "",
        linkedin: linkedin || "",
        upwork: upwork || "",
        telegram: telegram || "",
        customSocialLabel: customSocialLabel || "",
        customSocialUrl: customSocialUrl || "",
        location: location || SERVER_PROFILE.location,
        education: education || SERVER_PROFILE.education,
        bio: bio || SERVER_PROFILE.bio
      };

      return res.json({ success: true, message: "Profile updated successfully!", profile: SERVER_PROFILE });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // API 5: Get current dynamic skills
  app.get("/api/skills", (req, res) => {
    return res.json({ skills: SERVER_SKILLS });
  });

  // API 6: Add or update a skill
  app.post("/api/skills", (req, res) => {
    try {
      const { id, name, level } = req.body;
      if (!name || level === undefined) {
        return res.status(400).json({ error: "Missing required fields: name and level are required." });
      }
      
      const cleanLevel = Math.min(100, Math.max(0, parseInt(level) || 0));

      if (id) {
        const idx = SERVER_SKILLS.findIndex(s => s.id === id);
        if (idx !== -1) {
          SERVER_SKILLS[idx] = { id, name, level: cleanLevel };
          return res.json({ success: true, message: "Skill updated successfully on the server!", skill: SERVER_SKILLS[idx] });
        }
      }

      const newId = `skill-${Date.now()}`;
      const newSkill = { id: newId, name, level: cleanLevel };
      SERVER_SKILLS.push(newSkill);
      return res.json({ success: true, message: "New skill added successfully on the server!", skill: newSkill });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // API 7: Delete a skill
  app.delete("/api/skills/:id", (req, res) => {
    try {
      const { id } = req.params;
      const idx = SERVER_SKILLS.findIndex(s => s.id === id);
      if (idx !== -1) {
        SERVER_SKILLS.splice(idx, 1);
        return res.json({ success: true, message: "Skill deleted successfully on the server!" });
      }
      return res.status(404).json({ error: "Skill not found." });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Vite Integration for development / static server for product
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Full-Stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
