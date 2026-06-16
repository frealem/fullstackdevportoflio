import React, { useState, useEffect } from "react";
import {
  Code2,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  RefreshCw,
  Search,
  CheckCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  DollarSign,
  MapPin,
  Send,
  Zap,
  Terminal,
  ChevronRight,
  FileCheck,
  Award,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  X,
  Plus,
  Trash2,
  Edit2
} from "lucide-react";
import { DEFAULT_PROFILE, PROJECTS } from "./profileData";
import { Job, AppliedJob, ClientInquiry, Skill } from "./types";
import InteractiveSandbox from "./components/InteractiveSandboxes";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Mock analytics for the OmniPay live performance card
const ANALYTICS_DATA = [
  { name: "00:00", successRate: 98.4, volume: 120 },
  { name: "04:00", successRate: 99.2, volume: 80 },
  { name: "08:00", successRate: 99.5, volume: 210 },
  { name: "12:00", successRate: 98.9, volume: 380 },
  { name: "16:00", successRate: 99.1, volume: 420 },
  { name: "20:00", successRate: 99.7, volume: 290 },
  { name: "24:00", successRate: 99.9, volume: 150 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"clients" | "career">("clients");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Secure workspace unlocking gate
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("frealem_dev_unlocked") === "true" || localStorage.getItem("ephraim_dev_unlocked") === "true";
    }
    return false;
  });
  const [passcodeInput, setPasscodeInput] = useState("");
  const [unlockError, setUnlockError] = useState("");

  // Projects list state synchronized from database
  const [portfolioProjects, setPortfolioProjects] = useState<any[]>(PROJECTS);
  const [selectedProject, setSelectedProject] = useState<any>(PROJECTS[0]);

  // Showcases Manager Form States
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [showcaseForm, setShowcaseForm] = useState({
    title: "",
    category: "fullstack",
    githubUrl: "",
    liveUrl: "",
    description: "",
    longDescription: "",
    interactiveSandboxType: "",
    tags: "",
    iconName: "Layers"
  });
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [projectMessage, setProjectMessage] = useState("");

  // Fetch dynamic highlights from server
  const fetchDynamicProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      if (data && Array.isArray(data.projects)) {
        setPortfolioProjects(data.projects);
        // Backup to localStorage for absolute offline durability
        localStorage.setItem("frealem_portfolio_projects", JSON.stringify(data.projects));
      }
    } catch (err) {
      console.error("Failed to fetch showcases from database server:", err);
      const local = localStorage.getItem("frealem_portfolio_projects") || localStorage.getItem("ephraim_portfolio_projects");
      if (local) {
        try {
          setPortfolioProjects(JSON.parse(local));
        } catch (_) {}
      }
    }
  };

  // Skills lists state synced from DB / LocalStorage fallback
  const [skillsList, setSkillsList] = useState<Skill[]>([
    { id: "skill-1", name: "TypeScript & React", level: 95 },
    { id: "skill-2", name: "Go / Golang Node Backend", level: 88 },
    { id: "skill-3", name: "SQL Postgres & Drizzle", level: 86 },
    { id: "skill-4", name: "Docker Ingress Pipeline", level: 80 }
  ]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  
  // Skill edit UI state
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null); // For active inline update
  const [isAddingNewSkill, setIsAddingNewSkill] = useState(false); // To show inline creation form
  const [skillForm, setSkillForm] = useState({ name: "", level: 80 });
  const [isSavingSkill, setIsSavingSkill] = useState(false);
  const [skillError, setSkillError] = useState("");

  const fetchDynamicSkills = async () => {
    setSkillsLoading(true);
    try {
      const response = await fetch("/api/skills");
      const data = await response.json();
      if (data && Array.isArray(data.skills)) {
        setSkillsList(data.skills);
        localStorage.setItem("frealem_skills_list", JSON.stringify(data.skills));
      }
    } catch (err) {
      console.error("Failed to fetch skills from server:", err);
      const local = localStorage.getItem("frealem_skills_list");
      if (local) {
        try {
          setSkillsList(JSON.parse(local));
        } catch (_) {}
      }
    } finally {
      setSkillsLoading(false);
    }
  };

  // Dynamic editable profile data representing professional candidate details
  const [profile, setProfile] = useState<any>({
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
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<any>({
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
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const fetchDynamicProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      if (data && data.profile) {
        setProfile(data.profile);
        setProfileForm(data.profile);
        localStorage.setItem("frealem_profile_v2", JSON.stringify(data.profile));
      }
    } catch (err) {
      console.error("Failed to fetch profile from server:", err);
      const local = localStorage.getItem("frealem_profile_v2");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setProfile(parsed);
          setProfileForm(parsed);
        } catch (_) {}
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm)
      });
      const data = await response.json();
      if (data && data.success) {
        setProfile(data.profile);
        localStorage.setItem("frealem_profile_v2", JSON.stringify(data.profile));
        setIsEditingProfile(false);
      }
    } catch (err) {
      console.error("Failed to save profile on database:", err);
      setProfile(profileForm);
      localStorage.setItem("frealem_profile_v2", JSON.stringify(profileForm));
      setIsEditingProfile(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.name) {
      setSkillError("Name is required");
      return;
    }
    const skillLevel = Math.min(100, Math.max(0, Number(skillForm.level) || 0));

    setIsSavingSkill(true);
    setSkillError("");
    try {
      const payload = {
        id: editingSkill?.id || undefined,
        name: skillForm.name,
        level: skillLevel
      };

      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.success) {
        await fetchDynamicSkills();
        setEditingSkill(null);
        setIsAddingNewSkill(false);
        setSkillForm({ name: "", level: 80 });
      } else {
        setSkillError(data?.error || "Error saving skill.");
      }
    } catch (err) {
      console.warn("Saving skill server-offline fallback active:", err);
      const newId = editingSkill?.id || `fallback-skill-${Date.now()}`;
      const savedSkill: Skill = {
        id: newId,
        name: skillForm.name,
        level: skillLevel
      };

      const updated = editingSkill?.id
        ? skillsList.map(s => s.id === editingSkill.id ? savedSkill : s)
        : [...skillsList, savedSkill];

      setSkillsList(updated);
      localStorage.setItem("frealem_skills_list", JSON.stringify(updated));
      setEditingSkill(null);
      setIsAddingNewSkill(false);
      setSkillForm({ name: "", level: 80 });
    } finally {
      setIsSavingSkill(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) {
      return;
    }
    try {
      const res = await fetch(`/api/skills/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data && data.success) {
        await fetchDynamicSkills();
      } else {
        alert(data?.error || "Failed to delete skill.");
      }
    } catch (err) {
      console.warn("Deleting skill server-offline fallback active:", err);
      const updated = skillsList.filter(s => s.id !== id);
      setSkillsList(updated);
      localStorage.setItem("frealem_skills_list", JSON.stringify(updated));
    }
  };

  useEffect(() => {
    fetchDynamicProjects();
    fetchDynamicSkills();
    fetchDynamicProfile();
  }, []);

  // Sync selectedProject when projects list changes
  useEffect(() => {
    if (portfolioProjects && portfolioProjects.length > 0) {
      if (!selectedProject || !portfolioProjects.some(p => p.id === selectedProject.id)) {
        setSelectedProject(portfolioProjects[0]);
      } else {
        const found = portfolioProjects.find(p => p.id === selectedProject.id);
        if (found) {
          setSelectedProject(found);
        }
      }
    }
  }, [portfolioProjects]);

  // Project managers click handlers
  const handleEditProject = (proj: any) => {
    setEditingProject(proj);
    setShowcaseForm({
      title: proj.title,
      category: proj.category,
      githubUrl: proj.githubUrl || "",
      liveUrl: proj.liveUrl || "",
      description: proj.description,
      longDescription: proj.longDescription || proj.description,
      interactiveSandboxType: proj.interactiveSandboxType || "",
      tags: Array.isArray(proj.tags) ? proj.tags.join(", ") : String(proj.tags || ""),
      iconName: proj.iconName || "Layers"
    });
    setProjectMessage("");
  };

  const handleNewProject = () => {
    setEditingProject({ id: "" });
    setShowcaseForm({
      title: "",
      category: "fullstack",
      githubUrl: "",
      liveUrl: "",
      description: "",
      longDescription: "",
      interactiveSandboxType: "",
      tags: "React JS, Tailwind CSS, TypeScript",
      iconName: "Layers"
    });
    setProjectMessage("");
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showcaseForm.title || !showcaseForm.description) {
      alert("Showcase Title and Description are required.");
      return;
    }

    setIsSavingProject(true);
    setProjectMessage("");
    try {
      const payload = {
        id: editingProject?.id || undefined,
        title: showcaseForm.title,
        category: showcaseForm.category,
        githubUrl: showcaseForm.githubUrl,
        liveUrl: showcaseForm.liveUrl,
        description: showcaseForm.description,
        longDescription: showcaseForm.longDescription || showcaseForm.description,
        tags: showcaseForm.tags.split(",").map(s => s.trim()).filter(Boolean),
        iconName: showcaseForm.iconName || "Layers",
        interactiveSandboxType: showcaseForm.interactiveSandboxType || undefined
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.success) {
        setProjectMessage("Showcase updated and compiled live successfully!");
        await fetchDynamicProjects();
        setEditingProject(null);
      } else {
        setProjectMessage("Error: " + (data?.error || "Unknown response."));
      }
    } catch (err: any) {
      console.warn("Client fallback active (Server offline):", err);
      const newId = editingProject?.id || `custom-${Date.now()}`;
      const fallbackTags = showcaseForm.tags.split(",").map(s => s.trim()).filter(Boolean);
      const fallbackProj = {
        id: newId,
        title: showcaseForm.title,
        description: showcaseForm.description,
        longDescription: showcaseForm.longDescription || showcaseForm.description,
        tags: fallbackTags,
        category: showcaseForm.category as any,
        githubUrl: showcaseForm.githubUrl,
        liveUrl: showcaseForm.liveUrl,
        iconName: showcaseForm.iconName,
        interactiveSandboxType: showcaseForm.interactiveSandboxType || undefined
      };

      const updatedList = editingProject?.id 
        ? portfolioProjects.map(p => p.id === editingProject.id ? fallbackProj : p)
        : [...portfolioProjects, fallbackProj];

      setPortfolioProjects(updatedList);
      localStorage.setItem("frealem_portfolio_projects", JSON.stringify(updatedList));
      setProjectMessage("Synced successfully (Local Storage Backup Mode active)!");
      setEditingProject(null);
    } finally {
      setIsSavingProject(false);
    }
  };

  // States for Live Job Finder
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isGrounded, setIsGrounded] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState<"all" | "remote" | "onsite">("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // States for Resume / Cover Letter Advisor
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState<{
    coverLetter: string;
    adjustments: string[];
    interviewPrep: Array<{ question: string; bestAnswer: string }>;
  } | null>(null);

  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([
    {
      id: "app-1",
      title: "Frontend Engineer (React & TypeScript Expert)",
      company: "iCog Labs (via Afriwork)",
      location: "Addis Ababa, Ethiopia (Hybrid / Bole Workspace)",
      salary: "35k - 55k ETB/mo",
      dateApplied: "2026-06-10",
      status: "interviewing",
      notes: "Technical interview scheduled. Prepare responsive bento widgets & prompt-engineering examples."
    },
    {
      id: "app-2",
      title: "Remote Frontend Specialist",
      company: "Clipboard Scale (via LinkedIn)",
      location: "Remote (Global)",
      salary: "$4,000 - $6,000 USD/mo",
      dateApplied: "2026-06-11",
      status: "applied",
      notes: "Showcase synced beautifully. Compensation paid in Payoneer dashboard."
    }
  ]);

  // Client Inquiry form state
  const [clientInquiry, setClientInquiry] = useState({
    clientName: "",
    companyName: "",
    clientEmail: "",
    projectDescription: "",
    projectType: "Full-Stack SaaS",
    budgetRange: "$5,000 - $10,000",
  });
  const [inquiryStatus, setInquiryStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [simulatedQuote, setSimulatedQuote] = useState<{
    timeline: string;
    techSuggested: string[];
    estimatedHours: number;
  } | null>(null);

  // Load jobs on initial render or manual refresh
  const fetchLiveJobs = async () => {
    setIsLoadingJobs(true);
    setTailorResult(null);
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      if (data && Array.isArray(data.jobs)) {
        setJobs(data.jobs);
        setIsGrounded(!!data.grounded);
        if (data.jobs.length > 0) {
          setSelectedJob(data.jobs[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load live jobs feed:", err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchLiveJobs();
  }, []);

  // Handle Cover-Letter tailoring
  const runLetterTailoring = async (job: Job) => {
    setIsTailoring(true);
    setTailorResult(null);
    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          description: job.description + "\nRequirements:\n" + job.requirements.join("\n"),
          cvData: profile
        })
      });
      const data = await response.json();
      if (data) {
        setTailorResult(data);
      }
    } catch (err) {
      console.error("Tailoring evaluation failed:", err);
    } finally {
      setIsTailoring(false);
    }
  };

  // Handle Client inquiry submission with instant dynamic projection mapping
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientInquiry.clientName || !clientInquiry.clientEmail || !clientInquiry.projectDescription) {
      alert("Please complete the required fields.");
      return;
    }

    setInquiryStatus("submitting");
    setTimeout(() => {
      setInquiryStatus("success");
      
      // Calculate dynamic preview based on user selection
      let timeline = "3-4 Weeks";
      let hours = 110;
      let techSuggested = ["React 19 / Vite", "Tailwind CSS", "TypeScript", "Node.js Express", "PostgreSQL"];
      
      if (clientInquiry.projectType === "E-commerce System") {
        timeline = "5-6 Weeks";
        hours = 180;
        techSuggested.push("Redis Cash Routing", "OmniPay Payment Module");
      } else if (clientInquiry.projectType === "Real-Time / Logistics Dashboard") {
        timeline = "4-5 Weeks";
        hours = 140;
        techSuggested = ["React & D3 Charts", "Go (Golang) Microservice", "WebSockets Logs", "Docker"];
      }

      setSimulatedQuote({
        timeline,
        estimatedHours: hours,
        techSuggested
      });
    }, 1200);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleApplySimulated = (job: Job) => {
    const isAlreadyApplied = appliedJobs.some((a) => a.title === job.title && a.company === job.company);
    if (isAlreadyApplied) {
      alert("You have already added this job to your applications!");
      return;
    }

    const newApp: AppliedJob = {
      id: `app-${Date.now()}`,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      dateApplied: new Date().toISOString().split("T")[0],
      status: "to_apply",
      notes: "Tailored credentials generated. Ready to submit application via official job portal."
    };

    setAppliedJobs([newApp, ...appliedJobs]);
    alert(`Successfully pinned "${job.title}" to your career tracking dashboard!`);
  };

  const handleUpdateAppStatus = (id: string, newStatus: AppliedJob["status"]) => {
    setAppliedJobs(
      appliedJobs.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  // Filter jobs based on search options
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
      job.skillsRecommended.some((s) => s.toLowerCase().includes(jobSearchQuery.toLowerCase()));

    const matchesType =
      jobTypeFilter === "all" ||
      (jobTypeFilter === "remote" && job.type === "remote") ||
      (jobTypeFilter === "onsite" && job.type === "onsite");

    return matchesSearch && matchesType;
  });

  const handleToggleTab = () => {
    if (activeTab === "career") {
      setIsUnlocked(false);
      localStorage.removeItem("frealem_dev_unlocked");
      localStorage.removeItem("ephraim_dev_unlocked");
      setActiveTab("clients");
    } else {
      setActiveTab("career");
    }
  };

  const nameParts = (profile?.name || "Frealem Tekalign").split(" ");
  const firstName = (nameParts[0] || "FREALEM").toUpperCase();
  const lastName = (nameParts.slice(1).join(" ") || "TEKALIGN").toUpperCase();

  return (
    <div id="main-container" className="min-h-screen bg-[#060608] text-gray-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Professional Header Status Bar */}
      <div id="top-ticker" className="bg-[#0b0c10] border-b border-zinc-800/80 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center text-[11px] font-mono tracking-wider gap-3 z-20">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-zinc-400">ENGINEER STATUS: ACTIVE DEVELOPER LOOKING FOR EXTRAORDINARY CONTRACTS</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400" />
            UTC+3 Addis Ababa, ET
          </span>
          <span className="hidden md:inline">|</span>
          <span className="text-blue-400 flex items-center gap-1 font-semibold">
            <Zap className="w-3.5 h-3.5" />
            Vite Layout Speed: 99/100
          </span>
        </div>
      </div>

      {/* Hero Header Block */}
      <header id="app-header" className="max-w-7xl w-full mx-auto px-6 pt-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-900/40">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
              {firstName} <span className="text-blue-500 font-medium">{lastName}</span>
            </h1>
            <span 
              onClick={handleToggleTab} 
              className="text-zinc-650 hover:text-blue-500 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] self-center md:mt-2 cursor-pointer transition select-none"
              title="Toggle system view parameters"
            >
              Full Stack DEV
            </span>
          </div>
          <p className="text-zinc-400 font-mono text-xs md:text-sm tracking-widest mt-2 uppercase">
            {profile.title}
          </p>
        </div>
      </header>

      {/* Main Bento Grid Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        
        {/* TAB 1: ME & CAREER ENGINE VIEW (Jobs, Resume Advise, Applied Jobs Tracking) */}
        {activeTab === "career" && !isUnlocked && (
          <div id="developer-gatekeeper-wall" className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6 text-center mt-12 mb-12">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/25">
              <ShieldCheck className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white font-display">Developer Console Locked</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">
                The career dashboard, live application queues, and active showcase tools are restricted to Frealem&apos;s administrative usage.
              </p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const pin = passcodeInput.trim();
              if (pin === "frealem55" || pin === "frealem-access" || pin === "ephraim55" || pin === "ephraim-access") {
                setIsUnlocked(true);
                localStorage.setItem("frealem_dev_unlocked", "true");
                setUnlockError("");
              } else {
                setUnlockError("Verification Error: Invalid signature hash pin.");
              }
            }} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] text-zinc-500 font-mono font-semibold mb-1 uppercase tracking-wider">Secure Access Key Code</label>
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-700 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                  required
                />
                <span className="text-[10px] text-zinc-600 block mt-1.5 font-mono italic">This administrative console is restricted to certified administration only.</span>
              </div>

              {unlockError && (
                <p className="text-red-400 text-[10px] bg-red-950/20 border border-red-900/40 p-2 rounded font-mono">
                  {unlockError}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold p-2.5 rounded-xl text-xs transition uppercase font-mono tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Terminal className="w-4 h-4" />
                Deduce Identity Pin
              </button>
            </form>
          </div>
        )}

        {/* TAB 1: ME & CAREER ENGINE VIEW (Jobs, Resume Advise, Applied Jobs Tracking) */}
        {activeTab === "career" && isUnlocked && (
          <div className="space-y-6">
            
            {/* Upper Bento row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Box A: High-Concept Brief & Credentials (span 4) */}
              <div className="lg:col-span-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full filter blur-xl group-hover:bg-blue-500/15 transition-all duration-500"></div>
                
                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-3 font-mono text-xs text-left animate-fade-in w-full h-full flex flex-col justify-between">
                    <div className="flex justify-between items-center text-blue-400 font-bold border-b border-zinc-850 pb-1.5">
                      <span className="uppercase text-[9px] tracking-wider">Edit Profile Parameters</span>
                      <button 
                        type="button" 
                        onClick={() => setIsEditingProfile(false)}
                        className="text-zinc-500 hover:text-zinc-300 text-[10px] cursor-pointer"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                    
                    <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase font-semibold mb-1">Full Name *</label>
                        <input 
                          type="text" 
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase font-semibold mb-1">Professional Title *</label>
                        <input 
                          type="text" 
                          value={profileForm.title}
                          onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase font-semibold mb-1">Education details *</label>
                        <input 
                          type="text" 
                          value={profileForm.education}
                          onChange={(e) => setProfileForm({ ...profileForm, education: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase font-semibold mb-1">Workspace Location *</label>
                        <input 
                          type="text" 
                          value={profileForm.location}
                          onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase font-semibold mb-1">Contact Email *</label>
                        <input 
                          type="email" 
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="border-t border-zinc-850 pt-2 my-1">
                        <span className="block text-[9px] text-blue-400 uppercase font-bold">Social Media Parameters</span>
                      </div>

                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase font-semibold mb-1">GitHub (Domain format or link)</label>
                        <input 
                          type="text" 
                          value={profileForm.github}
                          onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          placeholder="github.com/username"
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase font-semibold mb-1">LinkedIn (Domain format or link)</label>
                        <input 
                          type="text" 
                          value={profileForm.linkedin}
                          onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          placeholder="linkedin.com/in/username"
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase font-semibold mb-1">Upwork (Domain format or link)</label>
                        <input 
                          type="text" 
                          value={profileForm.upwork}
                          onChange={(e) => setProfileForm({ ...profileForm, upwork: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          placeholder="upwork.com/freelancers/..."
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase font-semibold mb-1">Telegram (Domain format or link)</label>
                        <input 
                          type="text" 
                          value={profileForm.telegram}
                          onChange={(e) => setProfileForm({ ...profileForm, telegram: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          placeholder="t.me/username"
                        />
                      </div>

                      <div className="border-t border-zinc-850 pt-2 my-1">
                        <span className="block text-[9px] text-purple-400 uppercase font-bold">Add Custom Social Handle</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="block text-[8px] text-zinc-500 uppercase font-semibold mb-1">Social Label</label>
                          <input 
                            type="text" 
                            value={profileForm.customSocialLabel}
                            onChange={(e) => setProfileForm({ ...profileForm, customSocialLabel: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded p-1.5 text-2xs text-white focus:outline-none focus:border-blue-500"
                            placeholder="e.g. Medium, X"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-zinc-500 uppercase font-semibold mb-1">Social URL Link</label>
                          <input 
                            type="text" 
                            value={profileForm.customSocialUrl}
                            onChange={(e) => setProfileForm({ ...profileForm, customSocialUrl: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded p-1.5 text-2xs text-white focus:outline-none focus:border-blue-500"
                            placeholder="x.com/username"
                          />
                        </div>
                      </div>

                      <div className="border-t border-zinc-850 pt-2 my-1">
                        <span className="block text-[9px] text-zinc-500 uppercase font-bold">Professional Biography Strategy *</span>
                      </div>

                      <div>
                        <textarea 
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          rows={4}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-xs text-white leading-relaxed focus:outline-none focus:border-blue-500 font-sans"
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSavingProfile}
                      className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded font-bold uppercase tracking-wider transition cursor-pointer text-xs"
                    >
                      {isSavingProfile ? "Syncing Profile..." : "Commit Profile Updates"}
                    </button>
                  </form>
                ) : (
                  <>
                    <div>
                      <h2 className="text-zinc-500 text-2xs font-bold uppercase tracking-widest mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          Strategy Briefing
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileForm({ ...profile });
                            setIsEditingProfile(true);
                          }}
                          className="px-2 py-0.5 bg-blue-650/10 text-blue-400 border border-blue-500/10 hover:border-blue-500/30 rounded font-mono text-[9px] uppercase tracking-wider font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          [Edit Profile]
                        </button>
                      </h2>
                      <p className="text-xs text-zinc-300 leading-relaxed mb-4 whitespace-pre-wrap font-sans">
                        {profile.bio}
                      </p>
                      
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <div className="w-7 h-7 rounded bg-zinc-800/80 flex items-center justify-center text-blue-400 font-bold border border-zinc-700/60 font-mono">ED</div>
                          <div>
                            <p className="text-zinc-300 font-medium font-sans text-xs leading-tight">{profile.education}</p>
                            <p className="text-zinc-500 text-[9px] font-mono tracking-wider">ACADEMIC CREDENTIAL</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <div className="w-7 h-7 rounded bg-zinc-800/80 flex items-center justify-center text-emerald-400 font-bold border border-zinc-700/60 font-mono">LO</div>
                          <div>
                            <p className="text-zinc-300 font-medium font-sans text-xs leading-tight">{profile.location}</p>
                            <p className="text-zinc-500 text-[9px] font-mono tracking-wider">PHYSICAL WORKSPACE</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <div className="w-7 h-7 rounded bg-zinc-800/80 flex items-center justify-center text-purple-400 font-bold border border-zinc-700/60 font-mono">EM</div>
                          <div>
                            <p className="text-zinc-300 font-medium font-mono text-xs leading-tight select-all">{profile.email}</p>
                            <p className="text-zinc-500 text-[9px] font-mono tracking-wider">VERIFIED CONTACT DIRECTORY</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-zinc-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-mono">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Verified handles:</span>
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {profile.github && (
                          <a
                            href={profile.github.startsWith("http") ? profile.github : `https://${profile.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg border border-zinc-700 transition flex items-center gap-1 text-[11px] hover:text-white"
                          >
                            <Github className="w-3.5 h-3.5" />
                            GitHub
                          </a>
                        )}
                        {profile.linkedin && (
                          <a
                            href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://${profile.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg border border-zinc-700 transition flex items-center gap-1 text-[11px] hover:text-white"
                          >
                            <Linkedin className="w-3.5 h-3.5" />
                            LinkedIn
                          </a>
                        )}
                        {profile.upwork && (
                          <a
                            href={profile.upwork.startsWith("http") ? profile.upwork : `https://${profile.upwork}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-750 text-emerald-400 rounded-lg border border-zinc-700 transition flex items-center gap-1 text-[11px] hover:text-emerald-300 font-semibold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Upwork
                          </a>
                        )}
                        {profile.telegram && (
                          <a
                            href={profile.telegram.startsWith("http") ? profile.telegram : `https://${profile.telegram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-750 text-blue-400 rounded-lg border border-zinc-700 transition flex items-center gap-1 text-[11px] hover:text-blue-300 font-semibold"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Telegram
                          </a>
                        )}
                        {profile.customSocialUrl && (
                          <a
                            href={profile.customSocialUrl.startsWith("http") ? profile.customSocialUrl : `https://${profile.customSocialUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-750 text-purple-400 rounded-lg border border-zinc-700 transition flex items-center gap-1 text-[11px] hover:text-purple-300 font-semibold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {profile.customSocialLabel || "Link"}
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Box B: Dynamic Recruiter Job Scan Board (span 8) */}
              <div className="lg:col-span-8 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <div>
                      <h2 className="text-zinc-500 text-2xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        On-Refresh Real-Time Scanner
                      </h2>
                      <h3 className="text-xl font-bold text-white mt-1">Legitimate Verified Developer Openings</h3>
                    </div>

                    <button
                      onClick={fetchLiveJobs}
                      disabled={isLoadingJobs}
                      className="px-3.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 active:bg-blue-600/30 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-mono font-medium flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingJobs ? "animate-spin" : ""}`} />
                      Refresh Feed
                    </button>
                  </div>

                  {/* Filters & Search Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-4">
                    <div className="sm:col-span-6 relative">
                      <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                      <input
                        type="text"
                        value={jobSearchQuery}
                        onChange={(e) => setJobSearchQuery(e.target.value)}
                        placeholder="Search jobs e.g. React, Node, Go, Gebeya..."
                        className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div className="sm:col-span-6 flex bg-zinc-950/70 p-0.5 rounded-lg border border-zinc-850">
                      {(["all", "remote", "onsite"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setJobTypeFilter(type)}
                          className={`flex-1 text-[10px] py-1 font-mono font-bold uppercase rounded-md transition cursor-pointer ${
                            jobTypeFilter === type
                              ? "bg-zinc-850 text-white border border-zinc-700/30"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Job scroll results */}
                  {isLoadingJobs ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">
                        AI search grounding compiling secure database jobs...
                      </p>
                    </div>
                  ) : filteredJobs.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
                      <p className="text-zinc-500 text-xs font-mono">
                        No active verified roles matched your search parameters.
                      </p>
                      <button
                        onClick={() => {
                          setJobSearchQuery("");
                          setJobTypeFilter("all");
                        }}
                        className="text-blue-400 hover:text-blue-300 text-2xs uppercase tracking-wider font-bold mt-2 font-mono"
                      >
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                      {filteredJobs.map((job) => (
                        <div
                          key={job.id}
                          onClick={() => setSelectedJob(job)}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                            selectedJob?.id === job.id
                              ? "bg-zinc-850/90 border-blue-500/80 shadow-md shadow-blue-500/5"
                              : "bg-zinc-950/40 border-zinc-800/80 hover:bg-zinc-850/40 hover:border-zinc-700/80"
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1.5">
                              <h4 className="font-semibold text-zinc-100 text-xs leading-tight tracking-tight">
                                {job.title}
                              </h4>
                              <span
                                className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0 border ${
                                  job.type === "remote"
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                }`}
                              >
                                {job.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 font-medium mt-1 font-mono">{job.company}</p>
                            <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-zinc-600" />
                              {job.location}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/40 text-[9px] font-mono">
                            <span className="text-zinc-400 font-bold">{job.salary}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500">{job.level}</span>
                              <a
                                href={job.source}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent selecting the card when they just want to click the source link
                                }}
                                className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-0.5 border border-zinc-800 bg-zinc-950 px-1 py-0.5 rounded text-[8px] hover:border-zinc-700 transition"
                                title="Click to verify application source direct link"
                              >
                                Source ↗
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 p-2 bg-zinc-950/80 rounded-lg border border-zinc-850 flex items-center justify-between text-[10px] text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Scam-Shield Guard verified that listed links point direct to standard corporate HR platforms.</span>
                  </div>
                  {isGrounded && (
                    <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-bold px-1.5 rounded uppercase">
                      Grounding Live
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* Lower Bento row with split: Job detail/cv-tailoring & Live Applied Jobs Tracking (Grid 12) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Box C: Job Detail & Advisor Panel (span 7 or 8) */}
              <div className="lg:col-span-8 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
                {selectedJob ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-850 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-blue-500/10 text-blue-400 text-[9px] font-mono px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                            Active Slot
                          </span>
                          <span className="text-zinc-500 text-xs font-mono">{selectedJob.company}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mt-1 font-display leading-tight">{selectedJob.title}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApplySimulated(selectedJob)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          Pin Role
                        </button>
                        <a
                          href={selectedJob.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-blue-400 hover:text-blue-300 rounded-lg border border-zinc-700 text-xs font-mono font-bold flex items-center gap-1.5 transition uppercase tracking-wider"
                          title="View verified application source page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Check Source ↗
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Job specifications */}
                      <div className="md:col-span-5 space-y-3 font-mono text-xs">
                        <div className="bg-zinc-950/40 p-2.5 rounded border border-zinc-850">
                          <span className="block text-[9px] text-zinc-500 uppercase font-semibold">Verified SafeCheck</span>
                          <p className="text-zinc-300 text-[10px] leading-tight mt-1">{selectedJob.safeCheck.reasoning}</p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-[10px] text-zinc-400">Trust Score: </span>
                            <span className="text-emerald-400 font-bold">{selectedJob.safeCheck.trustScore}%</span>
                          </div>
                        </div>

                        <div className="space-y-1 bg-zinc-950/20 p-2 rounded">
                          <span className="block text-[8px] text-zinc-500 uppercase">Salary Rate</span>
                          <p className="font-bold text-white text-[13px]">{selectedJob.salary}</p>
                        </div>

                        <div>
                          <span className="block text-[9px] text-zinc-400 font-bold uppercase mb-1">Recommended Tech Stack:</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedJob.skillsRecommended.map((skill, i) => (
                              <span key={i} className="bg-zinc-805 text-zinc-300 font-bold text-[9px] px-1.5 py-0.5 rounded border border-zinc-800">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Job requirements & application tip */}
                      <div className="md:col-span-7 space-y-3">
                        <div>
                          <span className="block text-[9px] text-zinc-500 font-bold uppercase font-mono tracking-wider">Role Mandates</span>
                          <ul className="list-disc list-inside text-xs text-zinc-300 leading-normal space-y-0.5 mt-1">
                            {selectedJob.requirements.slice(0, 3).map((req, idx) => (
                              <li key={idx} className="text-zinc-300 truncate" title={req}>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-yellow-500/5 p-3 rounded-xl border border-yellow-500/10 text-xs">
                          <span className="block text-[9px] text-yellow-400 font-bold uppercase font-mono tracking-wider">
                            Surgical Cover-Letter Strategy
                          </span>
                          <p className="text-zinc-400 text-[11px] leading-relaxed mt-1">{selectedJob.applicationTips}</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Tailoring trigger & Output */}
                    <div className="pt-3 border-t border-zinc-850/60">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Analyze compatibility & transform CV specifically for this hiring manager:
                        </p>
                        <button
                          onClick={() => runLetterTailoring(selectedJob)}
                          disabled={isTailoring}
                          className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer transition disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {isTailoring ? "Tailoring Content..." : "Compile Cover Letter"}
                        </button>
                      </div>

                      {/* Tailor generated results preview */}
                      {tailorResult && (
                        <div className="mt-4 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-xl animate-fade-in text-xs">
                          <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between border-b border-zinc-800">
                            <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400">
                              COMPILED RECRUITMENT TOOLKIT FOR FREALEM
                            </span>
                            <button
                              onClick={() => setTailorResult(null)}
                              className="text-zinc-500 hover:text-zinc-300 text-xs"
                            >
                              ✕ Close Toolkit
                            </button>
                          </div>

                          <div className="p-4 space-y-4">
                            {/* Layout of dynamic tailoring split columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <span className="block text-[9px] text-blue-400 font-mono font-bold uppercase tracking-widest">
                                  Generated Pitch Letter
                                </span>
                                <textarea
                                  readOnly
                                  value={tailorResult.coverLetter}
                                  rows={11}
                                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-[10px] text-zinc-200 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/50 leading-relaxed"
                                />
                                <div className="text-right">
                                  <button
                                    onClick={() => copyToClipboard(tailorResult.coverLetter, "covLetter")}
                                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-mono text-[9px] rounded border border-zinc-700 transition"
                                  >
                                    {copiedText === "covLetter" ? "✓ Copied Letter!" : "Copy Letter"}
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-3.5">
                                {/* Adjustment points */}
                                <div>
                                  <span className="block text-[9px] text-indigo-400 font-mono font-bold uppercase tracking-widest mb-1.5">
                                    Strategic Portfolio Adjustments
                                  </span>
                                  <ul className="space-y-1">
                                    {tailorResult.adjustments.slice(0, 4).map((adj, i) => (
                                      <li key={i} className="flex items-start gap-1.5 text-[10px] text-zinc-300">
                                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                                        <span>{adj}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Prep Question highlight */}
                                <div className="bg-indigo-950/30 p-3 rounded-lg border border-indigo-900/30">
                                  <span className="block text-[9px] text-indigo-300 font-mono font-bold uppercase tracking-widest mb-1">
                                    Likely Interview Query
                                  </span>
                                  <p className="text-zinc-200 font-bold font-sans text-[11px] leading-snug">
                                    &quot;{tailorResult.interviewPrep?.[0]?.question}&quot;
                                  </p>
                                  <p className="text-zinc-400 text-[10px] font-mono leading-relaxed mt-1.5 bg-zinc-900/20 p-2 rounded border border-indigo-900/10">
                                    <strong>Winning Strategy:</strong> {tailorResult.interviewPrep?.[0]?.bestAnswer}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <Layers className="w-12 h-12 text-zinc-700 mx-auto mb-2 animate-bounce" />
                    <p className="text-zinc-400 text-sm">Select any verified remote or Ethiopian onsite job vacancy to initiate compiler analysis.</p>
                  </div>
                )}
              </div>

              {/* Box D: Personal Lead Pipeline & Application Tracker (span 4 or 5) */}
              <div className="lg:col-span-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-zinc-500 text-2xs font-bold uppercase tracking-widest mb-3 flex items-center justify-between">
                    <span>Applied Job Pipeline</span>
                    <span className="bg-blue-600/10 text-blue-400 text-[9px] font-mono font-extrabold px-1.5 rounded">
                      {appliedJobs.length} ACTIVE
                    </span>
                  </h2>

                  <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
                    {appliedJobs.map((app) => (
                      <div key={app.id} className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-850 space-y-2">
                        <div className="flex justify-between items-start gap-1.5">
                          <div>
                            <h4 className="font-bold text-zinc-200 text-xs leading-tight">{app.title}</h4>
                            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{app.company}</p>
                          </div>
                          
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateAppStatus(app.id, e.target.value as any)}
                            className="bg-zinc-900 text-zinc-300 text-[9px] font-mono font-bold uppercase border border-zinc-800 rounded py-0.5 px-1.5 focus:outline-none"
                          >
                            <option value="to_apply">To Apply</option>
                            <option value="applied">Applied</option>
                            <option value="interviewing">Interviewing</option>
                            <option value="offer">Offer Won</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>

                        {app.notes && (
                          <div className="p-1.5 bg-zinc-900/50 rounded border border-zinc-850/40 text-[9px] font-mono text-zinc-400">
                            <strong>Status Notes:</strong> {app.notes}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono pt-1">
                          <span>Salary: {app.salary}</span>
                          <span>Pinned: {app.dateApplied}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-850/60 text-[10px] text-zinc-500 font-mono leading-relaxed">
                  Pin or import any job, track your progress status seamlessly, and use the Cover-Letter Compiler to secure client and employer sign-offs.
                </div>
              </div>

            </div>

            {/* PORTFOLIO SHOWCASE MANAGER WORKSPACE CARD */}
            <div id="project-manager-widget" className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-850 pb-3 gap-3">
                <div>
                  <h3 className="text-sm font-mono font-bold text-zinc-400 flex items-center gap-1.5 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Portfolio Showcase Manager Workspace
                  </h3>
                  <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider mt-0.5">
                    Click any project to edit details or create a new spotlight showcase
                  </p>
                </div>
                <button
                  onClick={handleNewProject}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs rounded-lg transition uppercase flex items-center gap-1 cursor-pointer"
                >
                  Create Showcase Spot
                </button>
              </div>

              {/* Grid of current project edit selection triggers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {portfolioProjects.map(proj => (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => handleEditProject(proj)}
                    className="p-3 bg-zinc-950/60 hover:bg-zinc-850/40 border border-zinc-850 rounded-xl text-left transition flex justify-between items-center group cursor-pointer"
                  >
                    <div>
                      <h4 className="font-bold text-white text-xs leading-none">{proj.title}</h4>
                      <span className="text-[10px] text-zinc-500 font-mono mt-1 uppercase block">{proj.category}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition" />
                  </button>
                ))}
              </div>

              {/* Dynamic Form Editor */}
              {editingProject && (
                <form onSubmit={handleSaveProject} className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-5 space-y-4 text-xs animate-fade-in">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-2.5">
                    <span className="font-mono font-bold text-blue-400 uppercase text-[10px]">
                      {editingProject.id ? `EDIT SHOWCASE: ${editingProject.title}` : "NEW SHOWCASE CONFIGURATION ENTRY"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingProject(null)}
                      className="text-zinc-500 hover:text-zinc-200"
                    >
                      ✕ Cancel Form
                    </button>
                  </div>

                  {projectMessage && (
                    <div className="p-2 bg-blue-950/20 border border-blue-900 text-blue-400 font-mono rounded text-[10px]">
                      {projectMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-mono font-semibold uppercase mb-1">Showcase Title</label>
                      <input
                        type="text"
                        value={showcaseForm.title}
                        onChange={(e) => setShowcaseForm({...showcaseForm, title: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-blue-500 font-sans"
                        placeholder="e.g. My Microservice App"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-500 font-mono font-semibold uppercase mb-1">Technology Category</label>
                      <select
                        value={showcaseForm.category}
                        onChange={(e) => setShowcaseForm({...showcaseForm, category: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="fullstack">Full-Stack (SaaS / API Platforms)</option>
                        <option value="frontend">Frontend (Browser Layouts / UIs)</option>
                        <option value="backend">Backend (Microservices / Log Routers)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-500 font-mono font-semibold uppercase mb-1">Interactive Sandbox Playground</label>
                      <select
                        value={showcaseForm.interactiveSandboxType}
                        onChange={(e) => setShowcaseForm({...showcaseForm, interactiveSandboxType: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="">None (Standard Spotlight Card)</option>
                        <option value="api_simulator">API Simulator (Payment aggregations)</option>
                        <option value="regex_tester">Regex Log Sandbox (Logging parsers)</option>
                        <option value="sql_query_filter">SQL Relationship Studio (Multi-languages)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-mono font-semibold uppercase mb-1">GitHub Repository Link</label>
                      <input
                        type="url"
                        value={showcaseForm.githubUrl}
                        onChange={(e) => setShowcaseForm({...showcaseForm, githubUrl: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                        placeholder="https://github.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-500 font-mono font-semibold uppercase mb-1">Live Demo Showcase URL</label>
                      <input
                        type="url"
                        value={showcaseForm.liveUrl}
                        onChange={(e) => setShowcaseForm({...showcaseForm, liveUrl: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                        placeholder="https://my-demo.dev"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-500 font-mono font-semibold uppercase mb-1">Skills Tags (Comma Separated)</label>
                      <input
                        type="text"
                        value={showcaseForm.tags}
                        onChange={(e) => setShowcaseForm({...showcaseForm, tags: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-blue-500 font-sans"
                        placeholder="React, TypeScript, Tailwind"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-500 font-mono font-semibold uppercase mb-1">Short Grid Description (1-2 sentences)</label>
                    <input
                      type="text"
                      value={showcaseForm.description}
                      onChange={(e) => setShowcaseForm({...showcaseForm, description: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                      placeholder="Give a precise summary for cards."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-500 font-mono font-semibold uppercase mb-1">Spotlight Long Description (Full Paragraph)</label>
                    <textarea
                      value={showcaseForm.longDescription}
                      onChange={(e) => setShowcaseForm({...showcaseForm, longDescription: e.target.value})}
                      rows={3}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                      placeholder="Write a deep technical paragraph explaining target problem, architectural details, and outcome metrics..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingProject(null)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-mono text-[11px] rounded transition"
                    >
                      Dismiss Form
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingProject}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-[11px] rounded transition flex items-center gap-1 cursor-pointer"
                    >
                      {isSavingProject ? "Syncing..." : "Save & Sync Live"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* SKILLS MANAGEMENT & CALIBRATION WORKSPACE CARD */}
            <div id="skills-manager-widget" className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4 mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-850 pb-3 gap-3">
                <div>
                  <h3 className="text-sm font-mono font-bold text-zinc-400 flex items-center gap-1.5 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    Skill Map & Level Calibration Workspace
                  </h3>
                  <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider mt-0.5">
                    Manage standard and auxiliary technical skills displayed to prospective web clients
                  </p>
                </div>
                {!isAddingNewSkill && !editingSkill && (
                  <button
                    onClick={() => {
                      setIsAddingNewSkill(true);
                      setSkillForm({ name: "", level: 80 });
                      setSkillError("");
                    }}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs rounded-lg transition uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Skill Set
                  </button>
                )}
              </div>

              {/* Skill creation / editing form in-place */}
              {(isAddingNewSkill || editingSkill) && (
                <form onSubmit={handleSaveSkill} className="bg-zinc-950 p-5 border border-zinc-850 rounded-xl space-y-4 max-w-2xl font-mono text-xs animate-fade-in">
                  <div className="flex justify-between items-center text-blue-400 font-bold border-b border-zinc-850 pb-2">
                    <span className="uppercase text-[10px] tracking-wider">
                      {editingSkill ? `Edit Skill: ${editingSkill.name}` : "Create New Skill Metric"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSkill(null);
                        setIsAddingNewSkill(false);
                        setSkillForm({ name: "", level: 80 });
                      }}
                      className="text-zinc-500 hover:text-zinc-300 text-xs"
                    >
                      ✕ Cancel Form
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Skill Title/Name *</label>
                      <input
                        type="text"
                        required
                        value={skillForm.name}
                        onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                        placeholder="e.g. Next.js, Redis, Rust"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-250 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] text-zinc-400 uppercase font-bold">
                          Calibration Level:
                        </label>
                        <span className="text-blue-400 font-bold font-mono">{skillForm.level}%</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={skillForm.level}
                          onChange={(e) => setSkillForm({ ...skillForm, level: Number(e.target.value) })}
                          className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {skillError && (
                    <p className="text-red-400 text-[10px] bg-red-950/20 border border-red-900/30 p-2 rounded">
                      {skillError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-850/60">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSkill(null);
                        setIsAddingNewSkill(false);
                        setSkillForm({ name: "", level: 80 });
                      }}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-75 -text-zinc-300 rounded text-[10px] font-bold uppercase tracking-wider transition"
                    >
                      Dismiss Form
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingSkill}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                    >
                      {isSavingSkill ? "Saving..." : "Save Technical Skill"}
                    </button>
                  </div>
                </form>
              )}

              {/* Grid of current skills for edit / delete */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {skillsList.map((sk) => (
                  <div key={sk.id} className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-bold text-white text-xs tracking-tight truncate pr-2">{sk.name}</h4>
                        <span className="text-blue-400 font-mono font-bold text-xs">{sk.level}%</span>
                      </div>
                      <div className="h-1 bg-zinc-850 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${sk.level}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-zinc-900">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSkill(sk);
                          setSkillForm({ name: sk.name, level: sk.level });
                          setIsAddingNewSkill(false);
                          setSkillError("");
                        }}
                        className="px-2 py-1 text-[9px] font-mono text-zinc-400 hover:text-blue-400 border border-zinc-800 hover:border-blue-900 rounded bg-zinc-900/60 transition flex items-center gap-1 cursor-pointer"
                        title="Edit caliber details"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(sk.id)}
                        className="px-2 py-1 text-[9px] font-mono text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900 rounded bg-zinc-900/60 transition flex items-center gap-1 cursor-pointer"
                        title="Delete skill"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PORTFOLIO & INTERACTIVE WEB CLIENTS SHOWCASE */}
        {activeTab === "clients" && (
          <div className="space-y-6">
            
            {/* Upper Bento Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Box A: The Client Profile Pitch (span 5) */}
              <div className="lg:col-span-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-zinc-500 text-2xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Interactive Showcase
                  </h2>
                  <h3 className="text-2xl font-bold text-white mb-2 leading-tight font-display">
                    High Performance SaaS Design & Web Engineering
                  </h3>
                  <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                    I translate critical client mandates into responsive layouts, interactive analytics dashboards, and robust relational models. Toggle the spotlight projects below to check live simulated dashboards and test sandbox queries immediately.
                  </p>

                  <div className="space-y-2 mt-4 font-sans">
                    {portfolioProjects.map((proj) => (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => setSelectedProject(proj)}
                        className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                          selectedProject?.id === proj.id
                            ? "bg-zinc-850/90 border-blue-500 text-white shadow"
                            : "bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:bg-zinc-850/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2.5 h-2.5 rounded-full ${selectedProject?.id === proj.id ? "bg-blue-400 animate-pulse" : "bg-zinc-700"}`} />
                          <div>
                            <p className="font-bold text-xs">{proj.title}</p>
                            <span className="text-[9px] font-mono text-zinc-500 uppercase">{proj.category}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-zinc-850 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Core Frontend Mandate:</span>
                  <p className="text-xs text-blue-400 font-bold uppercase font-mono tracking-tighter">React 19 & Recharts</p>
                </div>
              </div>

              {/* Box B: Project Detail & Active Graph / Metrics (span 7) */}
              <div className="lg:col-span-7 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-850 pb-3 mb-4">
                    <div>
                      <span className="bg-zinc-800 text-zinc-400 text-[9px] font-mono px-2 py-0.5 rounded uppercase">
                        Spotlight Product
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1 leading-tight">{selectedProject.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition"
                      >
                        <Github className="w-3.5 h-3.5" />
                        Source
                      </a>
                      <a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Demo
                      </a>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-xs leading-relaxed mb-4">
                    {selectedProject.longDescription}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {selectedProject.tags.map((tag, i) => (
                      <span key={i} className="bg-zinc-800/60 text-zinc-400 text-[10px] px-2.5 py-0.5 rounded-full border border-zinc-800 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Display Recharts inside OmniPay for visual high fidelity */}
                  {selectedProject.id === "proj-1" && (
                    <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-850 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span>OMNIPAY SIMULATOR METRICS - 24Hr THROUGHPUT</span>
                        <span className="text-emerald-400 uppercase tracking-wider font-bold">AVG SLA Success: 99.34%</span>
                      </div>
                      <div className="h-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={ANALYTICS_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorUs" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                            <XAxis dataKey="name" stroke="#52525b" fontSize={9} />
                            <YAxis domain={[95, 100]} stroke="#52525b" fontSize={9} />
                            <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }} />
                            <Area type="monotone" dataKey="successRate" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUs)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Sandbox playground injector */}
                  {selectedProject.interactiveSandboxType && (
                    <InteractiveSandbox type={selectedProject.interactiveSandboxType} />
                  )}
                </div>

                <div className="mt-4 p-2 bg-blue-500/5 text-blue-400 rounded-lg border border-blue-500/10 text-2xs font-mono text-center">
                  ▲ Sandbox Playground displays live interactive mock states written to execute without external servers.
                </div>
              </div>

            </div>

            {/* Lower Bento row including Client Inquiry Form & Tech stack distribution (Grid 12) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Box C: Live Client Estimator & Inquiry form (span 8) */}
              <div className="lg:col-span-8 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-zinc-500 text-2xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Project Estimator
                  </h2>
                  <h3 className="text-xl font-bold text-white mb-4">Request a Pitch & Live Estimation</h3>

                  <form onSubmit={handleClientSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1 font-mono">Your Name / Agent *</label>
                        <input
                          type="text"
                          required
                          value={clientInquiry.clientName}
                          onChange={(e) => setClientInquiry({ ...clientInquiry, clientName: e.target.value })}
                          className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                          placeholder="Abebe / Sarah"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1 font-mono">Your Company / Agency</label>
                        <input
                          type="text"
                          value={clientInquiry.companyName}
                          onChange={(e) => setClientInquiry({ ...clientInquiry, companyName: e.target.value })}
                          className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                          placeholder="Gebeya Tech Ltd"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1 font-mono">Professional Email *</label>
                        <input
                          type="email"
                          required
                          value={clientInquiry.clientEmail}
                          onChange={(e) => setClientInquiry({ ...clientInquiry, clientEmail: e.target.value })}
                          className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                          placeholder="client@company.co"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1 font-mono">Project Type</label>
                        <select
                          value={clientInquiry.projectType}
                          onChange={(e) => setClientInquiry({ ...clientInquiry, projectType: e.target.value })}
                          className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                        >
                          <option value="Full-Stack SaaS">Full-Stack SaaS (Dashboard / REST)</option>
                          <option value="E-commerce System">E-commerce Marketplace Model</option>
                          <option value="Real-Time / Logistics Dashboard">Logistics Log Orchestration</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1 font-mono">Budget Tier Range</label>
                        <select
                          value={clientInquiry.budgetRange}
                          onChange={(e) => setClientInquiry({ ...clientInquiry, budgetRange: e.target.value })}
                          className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                        >
                          <option value="$3,000 - $5,000">$3,000 - $5,000 USD (SME System)</option>
                          <option value="$5,000 - $10,000">$5,000 - $10,000 USD (Fintech Core)</option>
                          <option value="$10,000+">$10,000+ USD (Custom Platform)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1 font-mono">Detailed Requirements & Flow Description *</label>
                      <textarea
                        required
                        value={clientInquiry.projectDescription}
                        onChange={(e) => setClientInquiry({ ...clientInquiry, projectDescription: e.target.value })}
                        rows={3}
                        className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                        placeholder="State what needs to be built e.g. An elegant pay widget connecting Telebirr to our international custom Node.js system..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={inquiryStatus === "submitting"}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {inquiryStatus === "submitting" ? "Compiling Quote Matrix..." : "Calculate Timeline Estimate"}
                    </button>
                  </form>

                  {/* Instant Quote Simulation Screen */}
                  {inquiryStatus === "success" && simulatedQuote && (
                    <div className="mt-4 p-4 bg-zinc-950 border border-blue-500/30 rounded-xl space-y-3 font-mono text-xs animate-fade-in">
                      <div className="flex justify-between items-center text-blue-400 font-bold border-b border-zinc-850 pb-2">
                        <span>✓ CALCULATION COMPLETED SUCCESSFULLY</span>
                        <button
                          onClick={() => setInquiryStatus("idle")}
                          className="text-zinc-500 hover:text-zinc-300 font-sans font-bold"
                        >
                          ✕ Reset
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-zinc-900 p-2.5 rounded border border-zinc-800">
                          <span className="block text-[8px] text-zinc-500 uppercase">Estimated Timeline</span>
                          <p className="text-zinc-200 font-bold text-xs mt-1">{simulatedQuote.timeline}</p>
                        </div>
                        <div className="bg-zinc-900 p-2.5 rounded border border-zinc-800">
                          <span className="block text-[8px] text-zinc-500 uppercase">Engineering Effort</span>
                          <p className="text-zinc-200 font-bold text-xs mt-1">{simulatedQuote.estimatedHours} Dev-Hours</p>
                        </div>
                        <div className="bg-zinc-900 p-2.5 rounded border border-zinc-800">
                          <span className="block text-[8px] text-zinc-500 uppercase">Recommended Architecture</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {simulatedQuote.techSuggested.map((tech, idx) => (
                              <span key={idx} className="bg-zinc-950 text-blue-400 text-[8px] font-bold px-1 rounded uppercase">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] text-zinc-400 font-sans leading-relaxed pt-1.5 border-t border-zinc-850/60">
                        Frealem will respond to project inquiries directly within 12 hours with a comprehensive roadmap presentation matching this simulated quote matrix. Thanks!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Box D: Skills Distribution (span 4) */}
              <div className="lg:col-span-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-zinc-500 text-2xs font-bold uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span>Skills Map & Level</span>
                    <span className="bg-blue-600/10 text-blue-400 text-[9px] font-mono px-1.5 rounded uppercase font-bold">
                      VERIFIED
                    </span>
                  </h2>

                  <div className="space-y-4 font-mono text-xs">
                    {skillsList.map((sk) => (
                      <div key={sk.id} className="space-y-1">
                        <div className="flex items-center justify-between text-zinc-300 font-medium text-[11px]">
                          <span>{sk.name}</span>
                          <span className="text-blue-400 font-bold">{sk.level}%</span>
                        </div>
                        <div className="h-1 bg-zinc-850 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${sk.level}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-850 flex flex-col gap-1 text-[10px] text-zinc-500 leading-normal font-mono">
                  <span>● Core Focus: Scalability</span>
                  <span>● Security first routing rules</span>
                  <span>● Strict DB normal forms optimization</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Professional Bento Footer with dynamic info and copyrights */}
      <footer id="app-footer" className="bg-[#0b0c10] border-t border-zinc-900/40 px-6 py-6 mt-12 text-zinc-600 text-[10px] uppercase font-mono tracking-widest text-center sm:text-left">
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-8">
            <span>Updated: June 2026</span>
            <span>Intermediate Full-Stack</span>
            <span>Non-Scam Live Verified Feed</span>
          </div>
          <div>
            Frealem Tekalign • Optimized Web Performance © 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
