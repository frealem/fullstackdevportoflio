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
  Edit2,
  Globe,
  Cpu,
  User
} from "lucide-react";
import { DEFAULT_PROFILE, PROJECTS } from "./profileData";
import { Job, AppliedJob, ClientInquiry, Skill, Service } from "./types";
import InteractiveSandbox from "./components/InteractiveSandboxes";

// Fallback services catalog when offline
const SERVICES_FALLBACK: Service[] = [
  {
    id: "serv-1",
    title: "Full-Stack SaaS Product Design & Engineering",
    description: "End-to-end development of custom software products featuring beautiful responsive dashboards, real-time analytics, and high-security API routes.",
    deliveryTime: "3 - 5 Weeks",
    features: [
      "Custom React & Vite Frontends",
      "Robust Node.js Express or FastAPI backend API controllers",
      "Database schema creation & optimization (Postgres/Mongo)",
      "Interactive analytics charts utilizing Recharts & D3",
      "Complete user authentication, security routing & JWT protocols"
    ],
    iconName: "Globe"
  },
  {
    id: "serv-2",
    title: "High-Speed Microservice Backend & API Integration",
    description: "Low-latency microservices, security reverse proxies, rate limiters, and custom asynchronous queue controllers optimized for heavy loads.",
    deliveryTime: "2 - 3 Weeks",
    features: [
      "Optimized Python FastAPI, Go, or Express.js services",
      "Asynchronous webhook queues & background transaction worker threads",
      "Redis caching & rate limiting middleware architecture",
      "Secure API proxy setups shield third-party system secrets",
      "Detailed telemetry tracking & custom system regex log parsers"
    ],
    iconName: "Cpu"
  },
  {
    id: "serv-3",
    title: "Interactive Admin Panels & Intelligent AI Grounding",
    description: "Sophisticated developer dashboards connected to online databases, with custom prompt tuning or Gemini Search Grounding features.",
    deliveryTime: "2 - 4 Weeks",
    features: [
      "Pristine Tailwind bento-grid administrative layouts",
      "Gemini SDK custom prompt integration & strict JSON formatting",
      "Full CRUD databases panels for portfolio, metrics, or content management",
      "CSV & logs import/export utilities for bulk operations",
      "Automated PDF or template generators (Cover Letters/Invoices/Brochures)"
    ],
    iconName: "Layers"
  }
];

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
  const [activeTab, setActiveTab] = useState<"career" | "clients" | "about" | "contact">("clients");
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
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Client inquiries inbox state for authorized administrators
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);

  const fetchInquiries = async () => {
    setIsLoadingInquiries(true);
    try {
      const res = await fetch("/api/inquiries");
      const data = await res.json();
      if (data && Array.isArray(data.inquiries)) {
        setInquiries(data.inquiries);
      }
    } catch (err) {
      console.error("Failed to fetch client inquiries from backend server:", err);
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this client message? This will erase it from both MongoDB and the backup flat-file.")) return;
    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast("Inquiry Deleted", "The message has been permanently deleted from all storage systems.", "success");
        setInquiries((prev) => prev.filter((i) => i.id !== id));
      } else {
        addToast("Delete Failed", data.error || "Failed to delete inquiry.", "warning");
      }
    } catch (err) {
      console.error("Failed to delete inquiry: ", err);
      addToast("Connection Error", "Could not reach the database backend server.", "warning");
    }
  };

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
    iconName: "Layers",
    imageUrl: ""
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

  // Services State and Lifecycle Operations
  const [servicesList, setServicesList] = useState<Service[]>(SERVICES_FALLBACK);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddingNewService, setIsAddingNewService] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    deliveryTime: "",
    features: "",
    iconName: "Globe"
  });
  const [isSavingService, setIsSavingService] = useState(false);
  const [serviceError, setServiceError] = useState("");

  const fetchDynamicServices = async () => {
    setServicesLoading(true);
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      if (data && Array.isArray(data.services)) {
        setServicesList(data.services);
        localStorage.setItem("frealem_services_list", JSON.stringify(data.services));
      }
    } catch (err) {
      console.error("Failed to fetch services from server:", err);
      const local = localStorage.getItem("frealem_services_list");
      if (local) {
        try {
          setServicesList(JSON.parse(local));
        } catch (_) {}
      } else {
        setServicesList(SERVICES_FALLBACK);
      }
    } finally {
      setServicesLoading(false);
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

  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);

  const fetchDbStatus = async () => {
    setIsCheckingDb(true);
    try {
      const res = await fetch("/api/db-status");
      const data = await res.json();
      if (data) {
        setDbStatus(data);
      }
    } catch (err) {
      console.warn("Failed to fetch database status from server:", err);
    } finally {
      setIsCheckingDb(false);
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

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title.trim() || !serviceForm.description.trim() || !serviceForm.deliveryTime.trim()) {
      setServiceError("Please fill out all required fields.");
      return;
    }
    setIsSavingService(true);
    setServiceError("");
    try {
      const cleanFeatures = serviceForm.features
        .split("\n")
        .map(f => f.trim())
        .filter(Boolean);

      const payload = {
        id: editingService?.id || undefined,
        title: serviceForm.title,
        description: serviceForm.description,
        deliveryTime: serviceForm.deliveryTime,
        features: cleanFeatures,
        iconName: serviceForm.iconName
      };

      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        addToast(
          editingService ? "Service Updated" : "Service Created",
          `Successfully saved "${serviceForm.title}" package configuration!`,
          "success"
        );
        setEditingService(null);
        setIsAddingNewService(false);
        setServiceForm({ title: "", description: "", deliveryTime: "", features: "", iconName: "Globe" });
        await fetchDynamicServices();
      } else {
        setServiceError(data.error || "Failed to save service package.");
      }
    } catch (err) {
      console.warn("Saving service offline fallback active:", err);
      const cleanFeatures = serviceForm.features
        .split("\n")
        .map(f => f.trim())
        .filter(Boolean);

      const fallbackService: Service = {
        id: editingService?.id || `fallback-serv-${Date.now()}`,
        title: serviceForm.title,
        description: serviceForm.description,
        deliveryTime: serviceForm.deliveryTime,
        features: cleanFeatures,
        iconName: serviceForm.iconName
      };
      
      let updatedList: Service[];
      if (editingService?.id) {
        updatedList = servicesList.map(s => s.id === editingService.id ? fallbackService : s);
      } else {
        updatedList = [...servicesList, fallbackService];
      }
      setServicesList(updatedList);
      localStorage.setItem("frealem_services_list", JSON.stringify(updatedList));
      addToast("Offline Sync Success", `Successfully saved "${serviceForm.title}" to local client cache.`, "info");
      setEditingService(null);
      setIsAddingNewService(false);
      setServiceForm({ title: "", description: "", deliveryTime: "", features: "", iconName: "Globe" });
    } finally {
      setIsSavingService(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service package?")) return;
    try {
      const response = await fetch(`/api/services/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        addToast("Service Removed", "The professional service option has been deleted from the database.", "info");
        await fetchDynamicServices();
      } else {
        alert(data.error || "Failed to delete service.");
      }
    } catch (err) {
      console.warn("Deleting service offline fallback active:", err);
      const updated = servicesList.filter(s => s.id !== id);
      setServicesList(updated);
      localStorage.setItem("frealem_services_list", JSON.stringify(updated));
      addToast("Removed Local Package", "Package deleted from local cache successfully.", "info");
    }
  };


  useEffect(() => {
    fetchDynamicProjects();
    fetchDynamicSkills();
    fetchDynamicProfile();
    fetchDynamicServices();
    fetchDbStatus();
    if (isUnlocked) {
      fetchInquiries();
    }
  }, []);

  // Sync inquiries if administrator unlocks dashboard
  useEffect(() => {
    if (isUnlocked) {
      fetchInquiries();
    }
  }, [isUnlocked]);

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
      iconName: proj.iconName || "Layers",
      imageUrl: proj.imageUrl || ""
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
      iconName: "Layers",
      imageUrl: ""
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
        interactiveSandboxType: showcaseForm.interactiveSandboxType || undefined,
        imageUrl: showcaseForm.imageUrl
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
        interactiveSandboxType: showcaseForm.interactiveSandboxType || undefined,
        imageUrl: showcaseForm.imageUrl
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

  // Preferred job titles & Toast notification system
  interface ToastMessage {
    id: string;
    title: string;
    description: string;
    type: "success" | "info" | "warning";
  }
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [preferredTitles, setPreferredTitles] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("frealem_preferred_job_titles");
      return stored ? JSON.parse(stored) : ["React", "TypeScript", "Frontend", "Backend", "Full-Stack"];
    } catch (e) {
      return ["React", "TypeScript", "Frontend", "Backend", "Full-Stack"];
    }
  });

  const addToast = (title: string, description: string, type: "success" | "info" | "warning" = "success") => {
    const newToast: ToastMessage = { id: `toast-${Date.now()}-${Math.random()}`, title, description, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 6000);
  };

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
        // Collect existing jobs' IDs to compare
        const existingJobIds = new Set(jobs.map((j) => j.id));

        // Detect matches
        const matches = data.jobs.filter((job: Job) => {
          return preferredTitles.some((pref) =>
            job.title.toLowerCase().includes(pref.trim().toLowerCase())
          );
        });

        // Filter out matches that were already present in the existing jobs list (truly newly loaded matches since last state)
        const newlyDiscoveredMatches = matches.filter((job: Job) => !existingJobIds.has(job.id));

        if (newlyDiscoveredMatches.length > 0) {
          addToast(
            "🎯 New Matches Discovered!",
            `Successfully loaded ${newlyDiscoveredMatches.length} new matching role(s) for keywords (${preferredTitles.slice(0, 3).join(", ")}...), e.g. "${newlyDiscoveredMatches[0].title}"!`,
            "success"
          );
        } else if (matches.length > 0) {
          addToast(
            "🔄 Feed Refreshed",
            `Latest feed synchronized. Found ${matches.length} active matching tracker opportunities.`,
            "info"
          );
        } else {
          addToast(
            "🔄 Feed Success",
            "Latest developer feed scanned and verified successfully.",
            "info"
          );
        }

        setJobs(data.jobs);
        setIsGrounded(!!data.grounded);
        if (data.jobs.length > 0) {
          setSelectedJob(data.jobs[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load live jobs feed:", err);
      addToast(
        "⚠️ Network Alert",
        "Unable to pull live recruiter data. Resilient offline fallback is active.",
        "warning"
      );
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

  // Handle Client inquiry submission with permanent MongoDB storage & Real email notifications
  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientInquiry.clientName || !clientInquiry.clientEmail || !clientInquiry.projectDescription) {
      addToast("Required Fields Missing", "Please complete all mandatory parameters.", "warning");
      return;
    }

    setInquiryStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientInquiry.clientName,
          clientEmail: clientInquiry.clientEmail,
          companyName: clientInquiry.companyName || "N/A",
          projectType: clientInquiry.projectType,
          budgetRange: clientInquiry.budgetRange,
          projectDescription: clientInquiry.projectDescription
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setInquiryStatus("success");
        addToast("Inquiry Dispatched!", "Your message was saved permanently to MongoDB Atlas & routed to Frealem's inbox.", "success");
        
        // Calculate dynamic preview based on user selection
        let timeline = "3-4 Weeks";
        let hours = 110;
        let techSuggested = ["React 19 / Vite", "Tailwind CSS", "TypeScript", "Node.js Express", "PostgreSQL"];
        
        if (clientInquiry.projectType === "E-commerce System") {
          timeline = "5-6 Weeks";
          hours = 180;
          techSuggested.push("Redis Caching", "OmniPay East Africa Payment integration");
        } else if (clientInquiry.projectType === "Real-Time / Logistics Dashboard") {
          timeline = "4-5 Weeks";
          hours = 140;
          techSuggested = ["React & D3.js Charts", "Go (Golang) Ingress Gateway", "WebSockets logs channels", "Docker Containers"];
        } else if (clientInquiry.projectType === "AI Integration / Prompt Engineering") {
          timeline = "2-3 Weeks";
          hours = 80;
          techSuggested = ["Google GenAI SDK", "Gemini 3.5 Flash", "Structured JSON Schema outputs", "Node.js Controller Proxy"];
        }

        setSimulatedQuote({
          timeline,
          estimatedHours: hours,
          techSuggested
        });
      } else {
        setInquiryStatus("idle");
        addToast("Submission Error", data.error || "Failed to commit inquiry to server storage.", "warning");
      }
    } catch (err: any) {
      console.error("Submission error: ", err);
      setInquiryStatus("idle");
      addToast("Connection Error", "Could not reach the database backend server.", "warning");
    }
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
    if (isUnlocked) {
      setIsUnlocked(false);
      localStorage.removeItem("frealem_dev_unlocked");
      localStorage.removeItem("ephraim_dev_unlocked");
      addToast("Console Locked", "Administrative developer console is now locked.", "info");
      if (activeTab === "career") {
        setActiveTab("clients");
      }
    } else {
      setShowUnlockModal(true);
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

      {/* Sleek Universal Navigation Tab Bar */}
      <div className="max-w-7xl w-full mx-auto px-6 pt-5">
        <nav className="flex flex-wrap items-center gap-2 border-b border-zinc-900/60 pb-3 font-mono text-xs">
          <button
            onClick={() => setActiveTab("clients")}
            className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium tracking-wide flex items-center gap-2 select-none cursor-pointer border ${
              activeTab === "clients"
                ? "bg-blue-600/10 text-blue-400 border-blue-500/30 shadow-md shadow-blue-500/5"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/40 border-transparent"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Interactive Showcases
          </button>

          <button
            onClick={() => setActiveTab("about")}
            className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium tracking-wide flex items-center gap-2 select-none cursor-pointer border ${
              activeTab === "about"
                ? "bg-blue-600/10 text-blue-400 border-blue-500/30 shadow-md shadow-blue-500/5"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/40 border-transparent"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            About Me
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium tracking-wide flex items-center gap-2 select-none cursor-pointer border ${
              activeTab === "contact"
                ? "bg-blue-600/10 text-blue-400 border-blue-500/30 shadow-md shadow-blue-500/5"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/40 border-transparent"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Contact Me & Hire
          </button>

          {isUnlocked && (
            <button
              onClick={() => setActiveTab("career")}
              className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium tracking-wide flex items-center gap-2 select-none cursor-pointer border ${
                activeTab === "career"
                  ? "bg-blue-600/10 text-blue-400 border-blue-500/30 shadow-md shadow-blue-500/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/40 border-transparent"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Career & Jobs Engine
            </button>
          )}

          {/* Administrative Unlock Status */}
          <div className="ml-auto">
            <span
              onClick={handleToggleTab}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition cursor-pointer select-none border ${
                isUnlocked
                  ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                  : "bg-zinc-950 text-zinc-600 border-zinc-900 hover:text-zinc-400 hover:border-zinc-850"
              }`}
              title="Toggle Admin Security System"
            >
              {isUnlocked ? "● ADMIN UNLOCKED" : "○ DEVS CONSOLE"}
            </span>
          </div>
        </nav>
      </div>

      {/* Main Bento Grid Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        
        {/* Verification modal for admin console */}
        {showUnlockModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6 text-center relative">
              <button
                type="button"
                onClick={() => {
                  setShowUnlockModal(false);
                  setUnlockError("");
                  setPasscodeInput("");
                }}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-350 transition text-xs font-mono"
              >
                ✕ Close
              </button>
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/25">
                <ShieldCheck className="w-5 h-5 text-blue-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white font-display">Developer Console Verification</h2>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  The admin console, inquiries database inbox, and dynamic system tools are restricted to Frealem&apos;s administrative usage.
                </p>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const pin = passcodeInput.trim();
                if (pin === "frealem55" || pin === "frealem-access" || pin === "ephraim55" || pin === "ephraim-access") {
                  setIsUnlocked(true);
                  localStorage.setItem("frealem_dev_unlocked", "true");
                  setUnlockError("");
                  setShowUnlockModal(false);
                  setActiveTab("career");
                  addToast("Identity Verified", "Welcome back, Frealem. Admin console unlocked.", "success");
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
          </div>
        )}

        {/* TAB 1: ME & CAREER ENGINE VIEW (Jobs, Resume Advise, Applied Jobs Tracking) */}
        {activeTab === "career" && isUnlocked && (
          <div className="space-y-6">
            {/* CLOUD DATABASES CONNECTION STATUS PANEL */}
            <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 shadow-lg animate-fade-in text-left">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4 mb-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Production MongoDB Atlas Database Hub
                    {dbStatus?.mongoActive ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-normal">Live Connected</span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 font-normal font-bold">Local File Backup Mode</span>
                    )}
                  </h3>
                  <p className="text-zinc-500 text-xs">
                    Current Active Store: <span className="font-mono text-zinc-300 font-bold">{dbStatus?.database || "db_portfolio.json (Local File Fallback)"}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchDbStatus}
                  disabled={isCheckingDb}
                  className="px-3.5 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg border border-zinc-700 font-mono transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDb ? 'animate-spin' : ''}`} />
                  {isCheckingDb ? "Sync status..." : "Check Status"}
                </button>
              </div>

              {/* Status breakdown grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {/* 1. MongoDB Atlas Status */}
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${dbStatus?.mongoActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'} border-4 ${dbStatus?.mongoActive ? 'border-emerald-500/20' : 'border-red-500/20'}`} />
                  <div className="space-y-1 flex-1">
                    <span className="text-zinc-300 font-bold text-xs block">MongoDB Atlas Cloud Cluster</span>
                    {dbStatus?.mongoActive ? (
                      <span className="text-[11px] font-mono text-emerald-400 block font-semibold">Active & Live Synced. All CRUD operations persist securely.</span>
                    ) : (
                      <span className="text-[11px] font-mono text-zinc-500 block">Offline fallback active. Please configure MONGODB_URI in secrets.</span>
                    )}
                    {dbStatus?.mongoError && (
                      <span className="text-[10px] font-mono text-red-400 block mt-1 overflow-hidden text-ellipsis whitespace-nowrap" title={dbStatus?.mongoError}>
                        Config Trace: {dbStatus?.mongoError}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Flat File Replication Status */}
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full mt-1.5 bg-emerald-500 animate-pulse border-4 border-emerald-500/20" />
                  <div className="space-y-1 flex-1">
                    <span className="text-zinc-300 font-bold text-xs block">Local JSON File Replication</span>
                    <span className="text-[11px] font-mono text-zinc-400 block">
                      Sync target: <code className="text-emerald-400 font-bold font-mono">db_portfolio.json</code>. Always active as a dual-write hot replica.
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left font-mono text-xs">
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850">
                    <span className="text-zinc-500 block text-[10px] uppercase">Profile Record</span>
                    <span className="text-white font-bold text-sm mt-1 block">1 Document</span>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850">
                    <span className="text-zinc-500 block text-[10px] uppercase">Projects Catalog</span>
                    <span className="text-white font-bold text-sm mt-1 block">{dbStatus?.counts?.projects || portfolioProjects.length} Documents</span>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850">
                    <span className="text-zinc-500 block text-[10px] uppercase">Skills Map</span>
                    <span className="text-white font-bold text-sm mt-1 block">{dbStatus?.counts?.skills || skillsList.length} Documents</span>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850">
                    <span className="text-zinc-500 block text-[10px] uppercase">Consulting Packages</span>
                    <span className="text-white font-bold text-sm mt-1 block">{dbStatus?.counts?.services || servicesList.length} Documents</span>
                  </div>
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 text-left">
                  <h4 className="text-cyan-400 text-xs font-bold mb-2 flex items-center gap-1.5 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    🚀 Deploying to Production (Render, Vercel, or Heroku):
                  </h4>
                  <p className="text-zinc-400 text-xs leading-relaxed mb-3">
                    To make edits persistent across redeploys or standard server restarts, configure a single environment variable 
                    in your hosting platform's Dashboard settings:
                  </p>
                  <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg mb-4 font-mono text-xs text-zinc-300">
                    <span className="text-yellow-400 font-bold block mb-1">🔑 Name: MONGODB_URI</span>
                    <span className="text-emerald-400 break-all block">Value: mongodb+srv://username:password@cluster0.abcde.mongodb.net/portfolio_db?retryWrites=true&w=majority</span>
                  </div>
                  
                  <h5 className="text-zinc-300 font-bold text-xs mb-1">⚠️ Important Security and Whitelisting Steps:</h5>
                  <ol className="text-zinc-400 text-xs space-y-1 list-decimal list-inside font-sans leading-relaxed">
                    <li>Log into your <strong className="text-emerald-500 font-sans">MongoDB Atlas Consolidated console</strong>.</li>
                    <li>Go to <strong className="text-zinc-200">Network Access</strong> (under Security tab in sidebar).</li>
                    <li>Because Render containers run under dynamically allocated, spinning server IPs, you <strong className="text-emerald-400 font-bold font-sans">MUST</strong> whitelist <code className="bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700 font-mono text-[10px] text-zinc-250">0.0.0.0/0</code> (Allow Access from Anywhere).</li>
                    <li>MongoDB is now fully primed for production deployment! Every project create, skills map edit, or custom service change propagates instantly.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* CLIENT INQUIRIES INBOX CARD */}
            <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 shadow-lg animate-fade-in text-left space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-850 pb-3 gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    Incoming Client Messages & Contracts
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/25 text-blue-400 font-normal">
                      {inquiries.length} Messages
                    </span>
                  </h3>
                  <p className="text-zinc-500 text-xs">
                    Synchronized live with MongoDB collection <code className="text-emerald-400 font-mono">inquiries</code>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchInquiries}
                  disabled={isLoadingInquiries}
                  className="px-3.5 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg border border-zinc-700 font-mono transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInquiries ? 'animate-spin' : ''}`} />
                  Refresh Inbox
                </button>
              </div>

              {isLoadingInquiries ? (
                <div className="text-center py-8 text-zinc-500 font-mono text-2xs uppercase">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                  Updating Live Inbox from MongoDB Atlas Cloud...
                </div>
              ) : inquiries.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 font-mono text-2xs uppercase border border-dashed border-zinc-850 rounded-xl bg-zinc-950/40">
                  Inbox is currently empty. No active client contracts submitted.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-1">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex flex-col justify-between space-y-4 hover:border-zinc-750/80 transition duration-300">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2 border-b border-zinc-900 pb-2">
                          <div>
                            <h4 className="text-white font-bold text-xs">{inq.clientName}</h4>
                            <p className="text-zinc-500 text-2xs font-mono">{inq.companyName || "No Company"}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 hover:border-red-500/25 rounded-md transition cursor-pointer"
                            title="Delete this message"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-zinc-400 uppercase">
                          <div className="bg-zinc-900/60 p-2 rounded border border-zinc-900">
                            <span className="text-[9px] text-zinc-650 block">System Type</span>
                            <span className="text-blue-400 font-bold mt-0.5 block truncate">{inq.projectType}</span>
                          </div>
                          <div className="bg-zinc-900/60 p-2 rounded border border-zinc-900">
                            <span className="text-[9px] text-zinc-650 block">Budget Tier</span>
                            <span className="text-emerald-400 font-bold mt-0.5 block truncate">{inq.budgetRange}</span>
                          </div>
                        </div>

                        <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-900 text-zinc-300 text-2xs leading-relaxed font-sans font-normal whitespace-pre-wrap max-h-[100px] overflow-y-auto">
                          {inq.projectDescription}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 border-t border-zinc-900 pt-2">
                        <span>Submitted: {new Date(inq.dateSubmitted).toLocaleDateString()}</span>
                        <a
                          href={`mailto:${inq.clientEmail}`}
                          className="text-blue-400 hover:text-blue-300 font-bold uppercase flex items-center gap-0.5"
                        >
                          Reply <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

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

                  {/* Preferred Job Keyword Monitor */}
                  <div className="mb-4 bg-zinc-950/60 rounded-xl p-3 border border-zinc-850/60 flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        Auto-Matched Preferences (Stored in browser)
                      </span>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const input = form.elements.namedItem("titleInput") as HTMLInputElement;
                          const val = input.value.trim();
                          if (val) {
                            if (!preferredTitles.some(pt => pt.toLowerCase() === val.toLowerCase())) {
                              const updated = [...preferredTitles, val];
                              setPreferredTitles(updated);
                              localStorage.setItem("frealem_preferred_job_titles", JSON.stringify(updated));
                              addToast("Preference Added", `Added "${val}" to job tracking alert parameters!`, "success");
                            } else {
                              addToast("Already Tracked", `"${val}" is already registered as a keyword.`, "info");
                            }
                            input.value = "";
                          }
                        }}
                        className="flex gap-1 w-full sm:w-auto"
                      >
                        <input
                          type="text"
                          name="titleInput"
                          placeholder="Add alert keyword e.g. Next.js"
                          className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-[10px] text-zinc-200 focus:outline-none focus:border-blue-500 font-mono w-full sm:w-36"
                        />
                        <button
                          type="submit"
                          className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-[10px] text-white font-mono font-bold rounded cursor-pointer transition uppercase"
                        >
                          + Add
                        </button>
                      </form>
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center">
                      {preferredTitles.length === 0 ? (
                        <p className="text-[10px] text-zinc-500 font-mono italic">No keyword alerts configured. Adding keywords will alert you to new matching opportunities upon refresh.</p>
                      ) : (
                        preferredTitles.map((title) => (
                          <span
                            key={title}
                            className="bg-blue-600/10 text-blue-400 hover:text-blue-350 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-blue-500/15 flex items-center gap-1 group transition"
                          >
                            {title}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = preferredTitles.filter(pt => pt !== title);
                                setPreferredTitles(updated);
                                localStorage.setItem("frealem_preferred_job_titles", JSON.stringify(updated));
                                addToast("Preference Removed", `Removed "${title}" from telemetry filters.`, "info");
                              }}
                              className="text-zinc-500 hover:text-red-400 font-bold transition ml-0.5 cursor-pointer leading-none"
                              title={`Remove ${title}`}
                            >
                              ✕
                            </button>
                          </span>
                        ))
                      )}
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

                  <div className="border-t border-zinc-850 pt-3 mt-1 pb-1">
                    <label className="block text-[10px] text-zinc-400 font-mono font-semibold uppercase mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                      SHOWCASE PREVIEW BANNER PHOTO OPTIONS (SELECT ANY TO USE OR CHOOSE CUSTOM)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-2">
                      {[
                        { name: "SaaS Dashboard", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" },
                        { name: "API Servers", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80" },
                        { name: "SQL Studio", url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80" },
                        { name: "Dev Workspace", url: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80" },
                        { name: "Digital Security", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80" },
                        { name: "AI & Neural Net", url: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80" },
                        { name: "Go Pipeline", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80" }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setShowcaseForm({ ...showcaseForm, imageUrl: preset.url })}
                          className={`group relative h-14 rounded-lg overflow-hidden border text-left transition cursor-pointer ${
                            showcaseForm.imageUrl === preset.url
                              ? "border-blue-500 ring-1 ring-blue-500/55"
                              : "border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover brightness-60 group-hover:brightness-85 transition duration-205" referrerPolicy="no-referrer" />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 p-0.5 text-center">
                            <span className="text-[7px] leading-none font-mono text-zinc-300 truncate block uppercase font-bold">{preset.name}</span>
                          </div>
                          {showcaseForm.imageUrl === preset.url && (
                            <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5 shadow-md">
                              <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="url"
                          value={showcaseForm.imageUrl || ""}
                          onChange={(e) => setShowcaseForm({ ...showcaseForm, imageUrl: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-1.5 text-[9.5px] text-white focus:outline-none focus:border-blue-500 font-mono"
                          placeholder="Or copy-paste any custom development photo URL directly..."
                        />
                      </div>
                      {showcaseForm.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setShowcaseForm({ ...showcaseForm, imageUrl: "" })}
                          className="px-2.5 py-1 bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-750 text-[9px] rounded transition font-mono uppercase cursor-pointer"
                        >
                          Clear URL
                        </button>
                      )}
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

            {/* SERVICES MANAGEMENT & CONSULTATION PACKAGES WORKSPACE CARD */}
            <div id="services-manager-widget" className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4 mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-850 pb-3 gap-3">
                <div>
                  <h3 className="text-sm font-mono font-bold text-zinc-400 flex items-center gap-1.5 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    Services I Provide & Packages Console
                  </h3>
                  <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider mt-0.5">
                    Customize consultation services, deliverables, and timeline matrices here
                  </p>
                </div>
                {!isAddingNewService && !editingService && (
                  <button
                    onClick={() => {
                      setIsAddingNewService(true);
                      setEditingService(null);
                      setServiceForm({
                        title: "",
                        description: "",
                        deliveryTime: "",
                        features: "",
                        iconName: "Globe"
                      });
                      setServiceError("");
                    }}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs rounded-lg transition uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Service Package
                  </button>
                )}
              </div>

              {/* Service creation / editing form in-place */}
              {(isAddingNewService || editingService) && (
                <form onSubmit={handleSaveService} className="bg-zinc-950 p-5 border border-zinc-850 rounded-xl space-y-4 font-mono text-xs animate-fade-in animate-duration-300">
                  <div className="flex justify-between items-center text-blue-400 font-bold border-b border-zinc-850 pb-2">
                    <span className="uppercase text-[10px] tracking-wider">
                      {editingService ? `Edit Service: ${editingService.title}` : "Configure New Consulting Service Option"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingService(null);
                        setIsAddingNewService(false);
                        setServiceForm({ title: "", description: "", deliveryTime: "", features: "", iconName: "Globe" });
                      }}
                      className="text-zinc-500 hover:text-zinc-300 text-xs"
                    >
                      ✕ Cancel Form
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Service Title *</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.title}
                        onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                        placeholder="e.g. Robust Node.js Microservice APIs"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-250 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Delivery Time Matrix *</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.deliveryTime}
                        onChange={(e) => setServiceForm({ ...serviceForm, deliveryTime: e.target.value })}
                        placeholder="e.g. 2 - 3 Weeks"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-250 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Dashboard Class/Icon Name</label>
                      <select
                        value={serviceForm.iconName}
                        onChange={(e) => setServiceForm({ ...serviceForm, iconName: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-250 focus:outline-none focus:border-blue-500"
                      >
                        <option value="Globe">Globe (Network apps, Web tools)</option>
                        <option value="Cpu">Cpu (Lower density microservices, systems)</option>
                        <option value="Layers">Layers (Dashboard design, AI systems)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Brief Description *</label>
                      <textarea
                        required
                        rows={2}
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        placeholder="Explain the overarching value metric for prospective clients..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-xs text-zinc-250 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] text-zinc-400 uppercase font-bold">Included Delivering Features (One per line) *</label>
                        <span className="text-zinc-500 text-[9px]">Type each deliverable on a new line</span>
                      </div>
                      <textarea
                        required
                        rows={4}
                        value={serviceForm.features}
                        onChange={(e) => setServiceForm({ ...serviceForm, features: e.target.value })}
                        placeholder="e.g.&#10;Feature Deliverable 1&#10;Feature Deliverable 2&#10;Feature Deliverable 3"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-xs text-zinc-250 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  {serviceError && (
                    <p className="text-red-400 text-[10px] bg-red-950/20 border border-red-900/30 p-2 rounded">
                      {serviceError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-850/60">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingService(null);
                        setIsAddingNewService(false);
                        setServiceForm({ title: "", description: "", deliveryTime: "", features: "", iconName: "Globe" });
                      }}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded text-[10px] font-bold uppercase tracking-wider transition"
                    >
                      Dismiss Form
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingService}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                    >
                      {isSavingService ? "Saving..." : "Save Service Package"}
                    </button>
                  </div>
                </form>
              )}

              {/* Grid of current services for edit / delete */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servicesList.map((service) => {
                  const IconComp = service.iconName === "Cpu" ? Cpu : service.iconName === "Layers" ? Layers : Globe;
                  return (
                    <div key={service.id} className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-start gap-2.5">
                            <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/10 shrink-0">
                              <IconComp className="w-3.5 h-3.5" />
                            </span>
                            <div>
                              <h4 className="font-bold text-white text-xs leading-tight line-clamp-1">{service.title}</h4>
                              <p className="text-zinc-500 text-[10px] leading-none mt-1 font-mono uppercase">
                                {service.deliveryTime}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-zinc-400 text-[11px] leading-relaxed mt-2.5 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="mt-2.5 space-y-1">
                          {service.features.slice(0, 2).map((feat, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-zinc-500 text-[10px] truncate">
                              <CheckCircle className="w-3 h-3 text-blue-500/80 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                          {service.features.length > 2 && (
                            <span className="text-zinc-650 text-[9px] font-mono pl-4.5 block uppercase">
                              + {service.features.length - 2} more deliverables
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-zinc-900">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingService(service);
                            setServiceForm({
                              title: service.title,
                              description: service.description,
                              deliveryTime: service.deliveryTime,
                              features: service.features.join("\n"),
                              iconName: service.iconName
                            });
                            setIsAddingNewService(false);
                            setServiceError("");
                          }}
                          className="px-2 py-1 text-[9px] font-mono text-zinc-400 hover:text-blue-400 border border-zinc-800 hover:border-blue-900 rounded bg-zinc-900/60 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(service.id)}
                          className="px-2 py-1 text-[9px] font-mono text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900 rounded bg-zinc-900/60 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
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
                    I translate critical client mandates into responsive layouts, interactive analytics dashboards, and robust relational models. Toggle the spotlight projects below to check detailed project showcases.
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

                  {selectedProject.imageUrl && (
                    <div className="w-full h-44 rounded-xl overflow-hidden mb-4 border border-zinc-800 relative group select-none">
                      <img 
                        src={selectedProject.imageUrl} 
                        alt={selectedProject.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent pointer-events-none"></div>
                    </div>
                  )}

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

                </div>
              </div>

            </div>

            {/* Lower Bento row including Skill Distribution Map */}
            <div className="grid grid-cols-1 gap-5">
              
              {/* Box D: Skills Distribution (Full Width) */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-zinc-500 text-2xs font-bold uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span>Skills Map & Verified Competencies</span>
                    <span className="bg-blue-600/10 text-blue-400 text-[9px] font-mono px-1.5 rounded uppercase font-bold text-xs">
                      VERIFIED SKILLS
                    </span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
                    {skillsList.map((sk) => (
                      <div key={sk.id} className="space-y-1 bg-zinc-950/30 p-3 rounded-xl border border-zinc-900">
                        <div className="flex items-center justify-between text-zinc-300 font-medium text-[11px]">
                          <span>{sk.name}</span>
                          <span className="text-blue-400 font-bold">{sk.level}%</span>
                        </div>
                        <div className="h-1 bg-zinc-850 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${sk.level}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-850 flex flex-wrap gap-x-8 gap-y-2 text-[10px] text-zinc-500 leading-normal font-mono">
                  <span>● Core Focus: Scalability</span>
                  <span>● Security first routing rules</span>
                  <span>● Strict DB normal forms optimization</span>
                </div>
              </div>

            </div>

            {/* NESTED SERVICES CATALOG SECTION */}
            <div className="mt-5 grid grid-cols-1 gap-5 animate-fade-in animate-duration-300">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-850 pb-4 gap-3">
                  <div>
                    <h2 className="text-zinc-400 text-2xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      Services I Provide & Engineered Solutions
                    </h2>
                    <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider mt-0.5">
                      High-fidelity consulting packages designed to take your software from concept to global scale
                    </p>
                  </div>
                  <div className="bg-blue-600/10 text-blue-400 font-mono text-[9px] font-bold px-2.5 py-1 rounded border border-blue-500/20 uppercase">
                    {servicesList.length} Active Offerings
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {servicesList.map((service) => {
                    const IconComponent = service.iconName === "Cpu" ? Cpu : service.iconName === "Layers" ? Layers : Globe;
                    return (
                      <div key={service.id} className="relative group bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-850 hover:border-zinc-700/60 rounded-xl p-5 flex flex-col justify-between transition-all duration-300">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/10 text-blue-400">
                              <IconComponent className="w-5 h-5" />
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-blue-300 transition duration-350">
                              {service.title}
                            </h3>
                            <p className="text-zinc-400 text-xs mt-2 font-sans leading-relaxed">
                              {service.description}
                            </p>
                          </div>

                          <div className="space-y-2 pt-3 border-t border-zinc-900">
                            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Included Deliverables:</span>
                            <ul className="space-y-1.5">
                              {service.features.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-zinc-300 text-[11px] leading-snug">
                                  <CheckCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-zinc-900/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                          <span>Delivery: {service.deliveryTime}</span>
                          <span className="text-blue-400/80 group-hover:text-blue-400 transition cursor-pointer flex items-center gap-1 font-bold uppercase tracking-wider">
                            Book Inquiry <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>


          </div>
        )}

        {/* TAB 3: ABOUT ME VIEW */}
        {activeTab === "about" && (
          <div className="space-y-8 animate-fade-in animate-duration-300">
            {/* Biography & Accolades Hero Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Primary bio & physical location card */}
              <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 font-mono text-[9px] font-bold rounded-full border border-blue-500/20 uppercase tracking-widest">
                      ACADEMIC BACKGROUND
                    </span>
                    <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-300 font-mono text-[9px] font-bold rounded-full uppercase tracking-widest">
                      AAU Alumni
                    </span>
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight leading-snug">
                    I am Frealem Tekalign, an Ethiopian-based software craftsman dedicated to high-fidelity, high-security digital systems.
                  </h2>
                  
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans font-normal whitespace-pre-wrap">
                    {profile.detailedBio || profile.bio}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-zinc-850/60 mt-6 font-mono text-2xs uppercase text-zinc-400">
                  <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-850 flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <div className="text-[9px] text-zinc-500 leading-none">Location</div>
                      <div className="font-bold text-white mt-1 leading-tight">Addis Ababa, ETH</div>
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-850 flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <div className="text-[9px] text-zinc-500 leading-none">Education</div>
                      <div className="font-bold text-white mt-1 leading-tight">AAU SE Degree</div>
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-850 flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <div className="text-[9px] text-zinc-500 leading-none">Availability</div>
                      <div className="font-bold text-white mt-1 leading-tight">Global Async 40h/w</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick profile credentials card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-mono text-2xs uppercase tracking-widest text-zinc-400">
                      Core Philosophies
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-850 flex items-start gap-3">
                      <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/10 shrink-0">
                        <FileCheck className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <h4 className="text-white text-xs font-bold leading-tight">Pristine Quality & Craft</h4>
                        <p className="text-zinc-500 text-[10px] mt-0.5 leading-relaxed font-sans">
                          Never shipping unfinished modules or messy styling coordinates.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-850 flex items-start gap-3">
                      <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/10 shrink-0">
                        <Cpu className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <h4 className="text-white text-xs font-bold leading-tight">Strict Type Integrity</h4>
                        <p className="text-zinc-500 text-[10px] mt-0.5 leading-relaxed font-sans">
                          100% compliant TypeScript compile patterns with zero fallback omissions.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-850 flex items-start gap-3">
                      <span className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/10 shrink-0">
                        <Terminal className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <h4 className="text-white text-xs font-bold leading-tight">Active Cloud Syncing</h4>
                        <p className="text-zinc-500 text-[10px] mt-0.5 leading-relaxed font-sans">
                          Every user transaction synchronized with dual MongoDB Atlas + local JSON backups.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-850 text-2xs space-y-2.5 font-mono">
                  <div className="flex justify-between items-center text-zinc-500">
                    <span>Active Language:</span>
                    <span className="text-zinc-300 font-bold">Amharic (Native)</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-500">
                    <span>Tech Business:</span>
                    <span className="text-zinc-300 font-bold">English (Fluent)</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-500">
                    <span>Working Hours:</span>
                    <span className="text-zinc-300 font-bold">08:00 - 20:00 EAT</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Structured Engineering Skill Matrix Grid */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="font-mono text-2xs uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Engineering Skill Matrix
                </h3>
                <p className="text-zinc-500 text-2xs uppercase font-mono mt-0.5">
                  Comprehensive map of core capabilities compiled through active production deployments
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Frontend Ecosystem */}
                <div className="p-5 bg-zinc-950/40 rounded-xl border border-zinc-850 space-y-4">
                  <h4 className="text-white text-xs font-bold font-mono uppercase tracking-wider pb-2 border-b border-zinc-900 flex items-center justify-between">
                    <span>1. Frontend Ecosystem</span>
                    <span className="text-blue-400 text-[10px]">Active</span>
                  </h4>
                  <div className="space-y-3 font-mono text-2xs text-zinc-300">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>React 18 / 19 & Next.js</span>
                        <span className="text-zinc-500 font-bold">98%</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: "98%" }}></div></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>TypeScript (Strict Mode)</span>
                        <span className="text-zinc-500 font-bold">96%</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: "96%" }}></div></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Tailwind CSS & Animations</span>
                        <span className="text-zinc-500 font-bold">95%</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: "95%" }}></div></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>State Management (Zustand/Redux)</span>
                        <span className="text-zinc-500 font-bold">92%</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: "92%" }}></div></div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Backend & Distributed Architectures */}
                <div className="p-5 bg-zinc-950/40 rounded-xl border border-zinc-850 space-y-4">
                  <h4 className="text-white text-xs font-bold font-mono uppercase tracking-wider pb-2 border-b border-zinc-900 flex items-center justify-between">
                    <span>2. Backend Controllers</span>
                    <span className="text-emerald-400 text-[10px]">Production</span>
                  </h4>
                  <div className="space-y-3 font-mono text-2xs text-zinc-300">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Node.js, Express & Bun</span>
                        <span className="text-zinc-500 font-bold">95%</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: "95%" }}></div></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Rest APIs & WebSocket Logs</span>
                        <span className="text-zinc-500 font-bold">94%</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: "94%" }}></div></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>FastAPI & Python Frameworks</span>
                        <span className="text-zinc-500 font-bold">88%</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: "88%" }}></div></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Security Middleware & SMTP</span>
                        <span className="text-zinc-500 font-bold">90%</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: "90%" }}></div></div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Persistence & DevOps Platforms */}
                <div className="p-5 bg-zinc-950/40 rounded-xl border border-zinc-850 space-y-4">
                  <h4 className="text-white text-xs font-bold font-mono uppercase tracking-wider pb-2 border-b border-zinc-900 flex items-center justify-between">
                    <span>3. Persistence & DevOps</span>
                    <span className="text-purple-400 text-[10px]">Cloud</span>
                  </h4>
                  <div className="space-y-3 font-mono text-2xs text-zinc-300">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>MongoDB Atlas & Relational SQL</span>
                        <span className="text-zinc-500 font-bold">92%</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{ width: "92%" }}></div></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Docker Containerization</span>
                        <span className="text-zinc-500 font-bold">85%</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{ width: "85%" }}></div></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Render / AWS Cloud Run</span>
                        <span className="text-zinc-500 font-bold">88%</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{ width: "88%" }}></div></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Google Gemini AI SDK</span>
                        <span className="text-zinc-500 font-bold">94%</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{ width: "94%" }}></div></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 4: CONTACT ME & HIRE VIEW */}
        {activeTab === "contact" && (
          <div className="space-y-8 animate-fade-in animate-duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Direct contact channels & Contract badges */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Urgent notification disclaimer */}
                <div className="p-5 bg-gradient-to-r from-blue-600/10 to-transparent border border-blue-500/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    <h4 className="text-white text-xs font-bold font-mono uppercase tracking-wider">Fast-Route Dispatch</h4>
                  </div>
                  <p className="text-zinc-400 text-2xs leading-relaxed font-sans font-normal">
                    Submitting this form commits your message directly to my MongoDB cloud databases and triggers an instantaneous direct notification alert to my primary inbox <strong>exprefgfg@gmail.com</strong> with high-importance priorities.
                  </p>
                </div>

                {/* Live Credentials Sidebar */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
                  <h3 className="font-mono text-2xs uppercase tracking-widest text-zinc-400 pb-3 border-b border-zinc-850 flex justify-between items-center">
                    <span>Direct Credentials</span>
                    <span className="text-zinc-650 text-[9px] font-bold font-mono">LIVE DIRECTORY</span>
                  </h3>

                  <div className="space-y-3">
                    
                    {/* Primary Email */}
                    <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-850 flex items-center justify-between group transition">
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/10">
                          <Mail className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="text-[10px] text-zinc-500 font-mono block uppercase">PRIMARY EMAIL</span>
                          <a href="mailto:exprefgfg@gmail.com" className="text-white hover:text-blue-400 text-xs font-semibold select-all font-mono">
                            exprefgfg@gmail.com
                          </a>
                        </div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard("exprefgfg@gmail.com", "Email address")}
                        className="text-zinc-600 hover:text-zinc-350 p-1 rounded font-mono text-[9px] uppercase font-bold"
                        title="Copy direct email address"
                      >
                        Copy
                      </button>
                    </div>

                    {/* Upwork Direct Contract Portal */}
                    <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-850 flex items-center justify-between group transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/10 shrink-0">
                          <Briefcase className="w-4 h-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-emerald-500 font-mono block uppercase font-bold tracking-wider">UPWORK DIRECT HIRE</span>
                          <a 
                            href="https://www.upwork.com/freelancers/~01a58722532efa8600?mp_source=share" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-white hover:text-emerald-400 text-xs font-semibold truncate block"
                          >
                            Go to Upwork Profile
                          </a>
                        </div>
                      </div>
                      <a 
                        href="https://www.upwork.com/freelancers/~01a58722532efa8600?mp_source=share" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1 text-emerald-500 hover:text-emerald-400 font-mono text-[9px] uppercase font-bold flex items-center gap-0.5 shrink-0"
                        title="Visit Upwork Profile"
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* LinkedIn Professional Network */}
                    <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-850 flex items-center justify-between group transition">
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/10">
                          <Linkedin className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="text-[10px] text-zinc-500 font-mono block uppercase">LINKEDIN NETWORK</span>
                          <a 
                            href="https://linkedin.com/in/frealemtekalign" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-white hover:text-blue-400 text-xs font-semibold"
                          >
                            frealemtekalign
                          </a>
                        </div>
                      </div>
                      <a 
                        href="https://linkedin.com/in/frealemtekalign" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1 text-blue-500 hover:text-blue-400 font-mono text-[9px] uppercase font-bold flex items-center gap-0.5"
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* GitHub Codebase Repository */}
                    <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-850 flex items-center justify-between group transition">
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-850">
                          <Github className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="text-[10px] text-zinc-500 font-mono block uppercase">GITHUB ENGINE</span>
                          <a 
                            href="https://github.com/frealem-tekalign" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-white hover:text-zinc-350 text-xs font-semibold"
                          >
                            @frealem-tekalign
                          </a>
                        </div>
                      </div>
                      <a 
                        href="https://github.com/frealem-tekalign" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1 text-zinc-400 hover:text-zinc-200 font-mono text-[9px] uppercase font-bold flex items-center gap-0.5"
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                  </div>
                </div>

              </div>

              {/* Right Column: Interactive Contract Submission Form */}
              <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
                
                {inquiryStatus !== "success" ? (
                  <form onSubmit={handleClientSubmit} className="space-y-5">
                    <div>
                      <h3 className="text-white font-bold text-lg font-display tracking-tight">
                        Launch a Direct Contract Request
                      </h3>
                      <p className="text-zinc-500 text-2xs uppercase font-mono tracking-wider mt-0.5">
                        Complete your system details to receive an instant timeline & technology architectural outline
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-zinc-400 font-mono text-[10px] uppercase font-bold">Your Full Name <span className="text-blue-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={clientInquiry.clientName}
                          onChange={(e) => setClientInquiry({ ...clientInquiry, clientName: e.target.value })}
                          placeholder="e.g. Alexander Graham"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-white font-sans text-xs focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 animate-none"
                        />
                      </div>

                      {/* Contact Email */}
                      <div className="space-y-1.5">
                        <label className="text-zinc-400 font-mono text-[10px] uppercase font-bold">Contact Email <span className="text-blue-500">*</span></label>
                        <input
                          type="email"
                          required
                          value={clientInquiry.clientEmail}
                          onChange={(e) => setClientInquiry({ ...clientInquiry, clientEmail: e.target.value })}
                          placeholder="e.g. client@company.com"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-white font-sans text-xs focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 animate-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Project Type */}
                      <div className="space-y-1.5">
                        <label className="text-zinc-400 font-mono text-[10px] uppercase font-bold">Project Core System</label>
                        <select
                          value={clientInquiry.projectType}
                          onChange={(e) => setClientInquiry({ ...clientInquiry, projectType: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 select-none cursor-pointer"
                        >
                          <option value="Full-Stack SaaS">Full-Stack SaaS Web Application</option>
                          <option value="E-commerce System">E-commerce Multi-Vendor System</option>
                          <option value="Real-Time / Logistics Dashboard">Real-Time Analytical Dashboard</option>
                          <option value="AI Integration / Prompt Engineering">AI Core Integration (Gemini/LLMs)</option>
                          <option value="General Consultation">Developer Consultation Hour</option>
                        </select>
                      </div>

                      {/* Budget Range */}
                      <div className="space-y-1.5">
                        <label className="text-zinc-400 font-mono text-[10px] uppercase font-bold">Budget Tier (USD)</label>
                        <select
                          value={clientInquiry.budgetRange}
                          onChange={(e) => setClientInquiry({ ...clientInquiry, budgetRange: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 select-none cursor-pointer"
                        >
                          <option value="< $5,000">Below $5,000 USD</option>
                          <option value="$5,000 - $10,000">$5,000 - $10,000 USD</option>
                          <option value="$10,000 - $20,000">$10,000 - $20,000 USD</option>
                          <option value="Custom Contract">Custom Retainer Agreement</option>
                        </select>
                      </div>
                    </div>

                    {/* Company Name */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-mono text-[10px] uppercase font-bold">Company / Team Name <span className="text-zinc-600 font-normal">(Optional)</span></label>
                      <input
                        type="text"
                        value={clientInquiry.companyName}
                        onChange={(e) => setClientInquiry({ ...clientInquiry, companyName: e.target.value })}
                        placeholder="e.g. Acme Tech Solutions"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-white font-sans text-xs focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 animate-none"
                      />
                    </div>

                    {/* Project Description */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-mono text-[10px] uppercase font-bold">Project Scope & Specifications <span className="text-blue-500">*</span></label>
                      <textarea
                        required
                        rows={5}
                        value={clientInquiry.projectDescription}
                        onChange={(e) => setClientInquiry({ ...clientInquiry, projectDescription: e.target.value })}
                        placeholder="Please describe what system you would like built, including core capabilities, pages, and target deadlines..."
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-white font-sans text-xs focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 resize-none leading-relaxed animate-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={inquiryStatus === "submitting"}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold py-3 px-6 rounded-xl transition duration-300 shadow-lg shadow-blue-600/15 cursor-pointer select-none flex items-center justify-center gap-2"
                    >
                      {inquiryStatus === "submitting" ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          DISPATCHING METADATA TO ATLAS...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          SUBMIT SECURE ENCRYPTED INQUIRY
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  // Success State: Display Custom Quotation / Proposal mapping
                  <div className="space-y-6 animate-fade-in animate-duration-500 text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-6 h-6" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-white font-bold text-lg font-display">Inquiry Confirmed & Transmitted</h3>
                      <p className="text-zinc-400 text-xs font-mono uppercase tracking-wider">
                        Real-time synchronization successful
                      </p>
                    </div>

                    <div className="p-5 bg-zinc-950/80 rounded-2xl border border-zinc-850 text-left space-y-4 max-w-xl mx-auto">
                      <h4 className="text-[11px] font-mono text-blue-400 uppercase tracking-widest border-b border-zinc-900 pb-2">
                        System Estimated Architecture
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4 font-mono text-2xs text-zinc-400 uppercase">
                        <div>
                          <span className="text-[10px] text-zinc-650 block leading-none">TIMELINE ESTIMATION</span>
                          <span className="text-white font-bold mt-1 block text-xs">{simulatedQuote?.timeline}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-650 block leading-none">TOTAL DEVELOPMENT HOURS</span>
                          <span className="text-white font-bold mt-1 block text-xs">{simulatedQuote?.estimatedHours} Dev-Hours</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-zinc-900">
                        <span className="text-[10px] text-zinc-650 block uppercase font-mono">Suggested Core Technologies:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {simulatedQuote?.techSuggested.map((tech, idx) => (
                            <span key={idx} className="bg-zinc-900 text-zinc-300 font-mono text-[9px] px-2.5 py-1 rounded border border-zinc-850">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-zinc-500 text-[10px] font-sans leading-relaxed pt-2 border-t border-zinc-900/60">
                        A direct alert was dispatched to <strong>exprefgfg@gmail.com</strong> with the subject <strong>"Urgent Portfolio Message"</strong>. Frealem will review the project specifications and respond within 6-12 working hours.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setInquiryStatus("idle");
                        setSimulatedQuote(null);
                        setClientInquiry({
                          clientName: "",
                          companyName: "",
                          clientEmail: "",
                          projectDescription: "",
                          projectType: "Full-Stack SaaS",
                          budgetRange: "$5,000 - $10,000",
                        });
                      }}
                      className="bg-zinc-800 hover:bg-zinc-750 text-zinc-350 hover:text-white font-mono text-2xs uppercase tracking-wider px-5 py-2.5 rounded-xl border border-zinc-700/55 transition cursor-pointer"
                    >
                      Submit Another Request
                    </button>
                  </div>
                )}

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

      {/* Floating Toast Alerts Portal */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3.5 rounded-xl border shadow-2xl flex items-start gap-3 backdrop-blur-md pointer-events-auto transform transition-all duration-300 animate-fade-in ${
              toast.type === "success"
                ? "bg-zinc-950/95 border-emerald-500/30 text-emerald-400"
                : toast.type === "warning"
                ? "bg-zinc-950/95 border-amber-500/35 text-amber-400"
                : "bg-zinc-950/95 border-blue-500/35 text-blue-400"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : toast.type === "warning" ? (
                <ShieldCheck className="w-4 h-4 text-amber-450" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[11px] text-zinc-100">{toast.title}</h4>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal font-mono">{toast.description}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-zinc-500 hover:text-zinc-350 font-bold text-xs transition cursor-pointer self-start shrink-0 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
