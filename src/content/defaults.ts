import type { PublishedSnapshot, SiteSections, ThemeSettings } from "@/types/cms";

export const defaultTheme: ThemeSettings = {
  primaryFont: "Inter",
  headingFont: "Cormorant Garamond",
  bodyFont: "Inter",
  bodySize: 16,
  heroHeadingSize: 104,
  sectionHeadingSize: 64,
  cardHeadingSize: 32,
  navSize: 13,
  buttonSize: 13,
  primaryColor: "#171714",
  secondaryColor: "#1d211e",
  accentColor: "#a5482f",
  backgroundColor: "#f3f0e9",
  surfaceColor: "#fbfaf6",
  headingColor: "#171714",
  bodyColor: "#686158",
  buttonBackground: "#171714",
  buttonText: "#fffdf8",
  borderColor: "#cbc5ba",
  borderRadius: 0,
  sectionSpacing: 128,
  containerWidth: 1440
};

export const defaultSections: SiteSections = {
  visibility: { profile: true, experience: true, portfolio: true, capabilities: true, innovation: true, education: true, contact: true },
  navigation: {
    resumeLabel: "Download Resume",
    items: [
      { id: "about", label: "About", href: "#about", visible: true },
      { id: "experience", label: "Experience", href: "#experience", visible: true },
      { id: "work", label: "Selected Work", href: "#work", visible: true },
      { id: "capabilities", label: "Capabilities", href: "#capabilities", visible: true },
      { id: "innovation", label: "AI Innovation", href: "#innovation", visible: false },
      { id: "contact", label: "Contact", href: "#contact", visible: true }
    ]
  },
  hero: {
    eyebrow: "Sharjah, UAE · Senior creative practice",
    title: "Senior Graphic Designer",
    positioning: "Brand, Campaign & Event Design | AI-Assisted Creative Workflows",
    introduction: "Senior Graphic Designer with 24 years of experience, including 21 years in the UAE, creating brand identities, integrated campaigns, event environments, presentations and digital experiences for leading regional and international organizations.",
    location: "Sharjah, UAE",
    primaryButtonLabel: "View Selected Work",
    resumeButtonLabel: "Download Resume",
    profileMediaId: null,
    profileFallbackUrl: "/fallback/liju-pankaj.jpg"
  },
  profile: {
    heading: "Strategy, craft and dependable delivery.",
    lead: "I build clear visual systems and carry them through demanding, fast-moving production environments—from the first campaign route to the final stage screen, brochure, social asset or presentation.",
    paragraphs: [
      "My experience spans strategic brand communication, large-format event and exhibition design, corporate and consumer campaigns, hospitality, financial services, presentation design and print production.",
      "Strong prepress knowledge helps me design for the realities of production. I collaborate across creative, account, production and client teams, mentor designers, and use AI-assisted workflows where they improve exploration, consistency or turnaround without compromising judgment."
    ],
    pillars: ["Brand communication", "Event scale", "Production precision", "Team collaboration"]
  },
  experience: {
    heading: "Two decades of UAE design experience.",
    items: [
      { id: "eleven777", period: "2011—Present", location: "Dubai", title: "Senior Graphic Designer / AI Workflow Specialist", company: "Eleven777 Advertising LLC", summary: "Develops brand, campaign, exhibition, hospitality, banking and presentation work across concurrent accounts. Coordinates with creative, account and production teams, mentors designers, and introduces practical AI-assisted methods." },
      { id: "nabeel", period: "2009—2011", location: "Ajman", title: "Production and Prepress Manager", company: "Nabeel Printing Press LLC", summary: "Managed prepress and production readiness, maintaining artwork quality, colour accuracy and reliable handoff from design through print." },
      { id: "modern", period: "2008—2009", location: "Sharjah", title: "Prepress Supervisor", company: "Modern Graphic Printing Press LLC", summary: "Supervised file preparation, colour and output checks, helping production teams resolve artwork issues before press." },
      { id: "sidra", period: "2006—2008", location: "Sharjah", title: "Graphic Designer, CTF and Scanner Operator", company: "Al Sidra Printing Press LLC", summary: "Created print-ready design work and operated core prepress imaging and film-output processes in a deadline-led environment." }
    ]
  },
  portfolio: {
    heading: "Selected work, published with care.",
    introduction: "Only verified project imagery assigned through the CMS is displayed here.",
    emptyMessage: "Portfolio imagery is being reviewed. Approved case studies will appear here when their verified assets are ready."
  },
  capabilities: {
    heading: "Creative breadth, organised around outcomes.",
    items: [
      { id: "brand", title: "Brand Identity & Campaign Design", summary: "Visual identity, key visuals, campaign systems and brand-consistent rollout." },
      { id: "events", title: "Event & Exhibition Graphics", summary: "Entrances, stages, signage, sponsor environments, screens and wayfinding." },
      { id: "digital", title: "Digital & Social Media Design", summary: "Paid social, bilingual adaptations, stories, carousels, EDMs and web banners." },
      { id: "print", title: "Editorial, Print & Prepress", summary: "Brochures, reports, collateral, colour, file preparation and production control." },
      { id: "presentations", title: "Presentation & Sales Collateral", summary: "Corporate presentations, pitch materials, structured content and infographics." },
      { id: "motion", title: "Motion Graphics & Video", summary: "Social motion, screen content, editing and campaign adaptations." },
      { id: "ux", title: "UI/UX & Responsive Fundamentals", summary: "Clear hierarchy, interface thinking, responsive layouts and digital usability." },
      { id: "ai", title: "AI-Assisted Creative Production", summary: "Prompt-led exploration, image workflows and faster content variation." },
      { id: "automation", title: "Creative Workflow Automation", summary: "Practical workflow improvements using Python, APIs and LLM-assisted tools." },
      { id: "mentoring", title: "Mentoring & Collaboration", summary: "Designer support, cross-functional coordination and parallel project delivery." }
    ],
    tools: ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "After Effects", "Premiere Pro", "Adobe XD", "PowerPoint", "Google Web Designer", "HTML/CSS", "WordPress", "ChatGPT", "Claude", "Gemini", "Midjourney", "Runway", "OpenAI Codex", "Sora", "Freepik AI", "Lovable.dev"]
  },
  innovation: {
    heading: "AI & Creative Innovation",
    introduction: "AI supports the design practice—not the other way around. I contribute to internal applications that improve creative exploration, design verification and production workflows.",
    accessNote: "Private internal applications — Eleven777 access required. Visitors without an authorized account will see only a login or access-denied screen.",
    apps: [
      { id: "vector-guard", name: "VectorGuard AI", purpose: "AI-assisted vector-file verification for print and prepress readiness.", problem: "Brings colour-space, raster-image and production-readiness checks into one repeatable workflow.", contribution: "Created and developed VectorGuard AI, including the product concept and validation workflow.", technologies: ["AI-assisted validation", "Python", "APIs", "Vector-file analysis"], url: "https://preflight-hub.eleven777.app", featured: true },
      { id: "edm-guard", name: "EDM Compliance Guard", purpose: "Checks EDM layouts, dimensions, spacing and brand compliance.", problem: "Gives design teams a consistent review path for recurring layout requirements.", contribution: "Contributed to design and workflow development within Eleven777’s internal AI-tools initiative.", technologies: ["Rules-based checks", "Brand-compliance logic", "Web workflows"], url: "https://preflight-hub.eleven777.app", featured: true },
      { id: "design-inspector", name: "Design Inspector", purpose: "Inspects PDF, AI and EPS files for colour, vector quality and production issues.", problem: "Consolidates common artwork checks across several professional file formats.", contribution: "Contributed to design and workflow development for the internal file-inspection experience.", technologies: ["PDF, AI & EPS analysis", "Colour validation", "Vector-quality checks"], url: "https://designinspectorpro.lovable.app", featured: true },
      { id: "idea-hub", name: "Idea Generation Hub", purpose: "Supports structured creative ideation and strategy development.", problem: "Organises the progression from an initial idea to a clearer creative direction.", contribution: "Contributed to product concept, design and workflow development for LLM-assisted ideation.", technologies: ["LLM-assisted ideation", "Prompt workflows", "Generative AI"], url: "https://igh.eleven777.app/", featured: true },
      { id: "social-editor", name: "Social Content + Visual Editor", purpose: "Generates and edits social-media content and supporting visuals.", problem: "Connects copy development and visual iteration in one internal workflow.", contribution: "Contributed to design and workflow development for AI-assisted social-content production.", technologies: ["Generative AI", "Content workflows", "Visual editing"], url: "https://social.eleven777.app/", featured: false },
      { id: "estimator", name: "Estimator Tool", purpose: "Supports project estimation and proposal preparation.", problem: "Automates repetitive estimation steps and organises project information.", contribution: "Built Eleven777 Estimate AI using Codex, Lovable.dev and LLM workflows.", technologies: ["OpenAI Codex", "Lovable.dev", "LLM workflows"], url: "https://estimator.eleven777-preflight-hub.com/", featured: false }
    ]
  },
  education: {
    heading: "Education & languages",
    items: [
      { id: "multimedia", qualification: "Diploma in Multimedia", institution: "C-DAC, Kerala" },
      { id: "software", qualification: "Diploma in Software & Hardware Management", institution: "C-DAC, Kerala" },
      { id: "degree", qualification: "Degree", institution: "St. Cyril’s College, Adoor, Kerala" }
    ],
    languages: ["English", "Hindi", "Malayalam"]
  },
  contact: { heading: "Let’s build communication that works at every scale.", email: "lijupankaj@gmail.com", phone: "+971 55 272 9279", location: "Sharjah, UAE", buttonLabel: "Start a conversation" },
  footer: { copyright: "Liju Pankaj", descriptor: "Senior Graphic Designer · Sharjah, UAE" },
  resume: { mediaId: null, fallbackUrl: "/fallback/liju-pankaj-resume-2026.pdf", downloadLabel: "Download Resume" }
};

export const defaultSnapshot: PublishedSnapshot = {
  schemaVersion: 1,
  revision: 0,
  publishedAt: null,
  theme: defaultTheme,
  sections: defaultSections,
  projects: [],
  categories: [],
  media: []
};
