export type ProjectCategory = "Professional" | "Product" | "Tool";
export type MediaAssetType = "Image" | "Screenshot" | "Diagram" | "Document" | "Video" | "Link";

export type MediaAsset = {
  title: string;
  type: MediaAssetType;
  url: string;
  caption?: string;
  alt?: string;
};

export type ProfileMedia = {
  avatarUrl?: string;
  avatarAlt?: string;
  coverImageUrl?: string;
  resumeUrl?: string;
};

export type ProjectMedia = {
  icon?: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  assets: MediaAsset[];
};


export const profile = {
  name: "Huy Vo",
  shortName: "HV",
  role: "Project Manager & Functional Consultant",
  headline: "I turn business requirements into practical software solutions.",
  description:
    "Focused on software implementation, business analysis, workflow design and delivery for education management systems.",
  location: "Ho Chi Minh City, Vietnam",
  email: "hello@example.com",
  availability: "Open to professional connections",
  media: {
    avatarUrl: "",
    avatarAlt: "Portrait photo of Huy Vo",
    coverImageUrl: "",
    resumeUrl: "",
  } as ProfileMedia,
  specialties: [
    "Project Management",
    "Functional Consulting",
    "Business Analysis",
    "SQL & Data",
  ],
  about: [
    "I work at the intersection of business operations and software delivery, translating real-world requirements into clear workflows and executable product decisions.",
    "My approach prioritizes practical solutions, structured communication, data validation and close coordination between customers, product, development and testing teams.",
  ],
  careerSummary: {
    title: "Professional snapshot",
    text: "Project-focused professional working across requirements, business processes, data and software delivery. I help teams turn operational needs into structured solutions that can be built, validated and deployed.",
    highlights: [
      { label: "Primary role", value: "PM / Functional Consultant" },
      { label: "Domain focus", value: "Education Technology" },
      { label: "Core strength", value: "Business → Software" },
      { label: "Working style", value: "Structured & Practical" },
    ],
  },
  experience: [
    {
      period: "Current",
      role: "Project Manager / Functional Consultant",
      organization: "Education Software & University Management",
      summary:
        "Coordinate software implementation while translating business requirements into functional workflows, specifications and delivery decisions.",
      responsibilities: [
        "Analyze requirements, operational processes and implementation constraints.",
        "Coordinate customers, product, development, testing and support stakeholders.",
        "Support functional specification, UAT, data validation and production rollout.",
        "Track delivery risks, clarify issues and drive practical resolution across teams.",
      ],
      tags: ["Project Management", "Requirements", "UAT", "SQL", "Deployment"],
    },
  ],
  projects: [
    {
      title: "University Management Platform",
      slug: "university-management-platform",
      category: "Professional" as ProjectCategory,
      year: "Current",
      role: "Project Manager / Functional Consultant",
      summary:
        "Implementation and functional delivery for university management workflows, with a strong focus on requirements, data validation, UAT and stakeholder coordination.",
      contributions: [
        "Business process and requirement analysis",
        "Functional workflow and solution design",
        "UAT coordination and production rollout",
      ],
      technologies: ["Project Management", "SQL Server", "Jira", "UAT"],
      featured: true,
      media: {
        icon: "UM",
        thumbnailUrl: "",
        thumbnailAlt: "University management workflow preview",
        assets: [
          { title: "Workflow overview", type: "Diagram", url: "", caption: "Add a workflow diagram or sanitized screenshot when available.", alt: "University workflow diagram" },
        ],
      } as ProjectMedia,
      caseStudy: {
        context: "University management software involves many connected processes, stakeholder groups and operational rules that must work together in production.",
        problem: "Business requirements can become fragmented across discussions, data checks, UAT feedback and implementation constraints, increasing delivery risk if they are not translated into a shared functional view.",
        process: ["Clarify business rules and stakeholder expectations", "Map workflows, dependencies and data conditions", "Coordinate implementation, testing and issue resolution", "Validate real scenarios through UAT and rollout support"],
        solution: "Use structured functional analysis and cross-team coordination to turn operational requirements into workflows, testable behaviors and practical delivery decisions.",
        result: "A clearer bridge between business users and delivery teams, with stronger traceability from requirement analysis through validation and production rollout.",
        lessons: ["Clarify edge cases before development starts", "Treat data validation as part of functional delivery", "Keep business, development and testing aligned around the same workflow"],
      },
    },
    {
      title: "ASC-WORKING",
      slug: "asc-working",
      category: "Product" as ProjectCategory,
      year: "2026",
      role: "Product Owner / Builder",
      summary:
        "A working-list and project workspace concept for managing issues, deadlines, project documents, filters and configurable work views.",
      contributions: [
        "Product planning and workflow design",
        "Issue-management UX and configurable views",
        "Document and attachment workflow planning",
      ],
      technologies: ["Next.js", "TypeScript", "Google Drive", "Product Design"],
      featured: true,
      media: {
        icon: "AW",
        thumbnailUrl: "",
        thumbnailAlt: "ASC-WORKING project workspace preview",
        assets: [
          { title: "Workspace dashboard", type: "Screenshot", url: "", caption: "Add a screenshot of issue lists, filters or project document views.", alt: "ASC-WORKING dashboard screenshot" },
        ],
      } as ProjectMedia,
      caseStudy: {
        context: "Project work often spreads issues, deadlines, documents and operational views across multiple tools.",
        problem: "When work information is fragmented, it becomes harder to prioritize, filter, follow up and keep project context attached to the actual issue being handled.",
        process: ["Define the core issue-management workflow", "Design configurable list and filter experiences", "Plan attachment and project-document handling", "Iterate the product through versioned releases"],
        solution: "Create a configurable project workspace centered on issues, deadlines, views and supporting documents instead of forcing users into a fixed workflow.",
        result: "A product direction that consolidates day-to-day project operations into one focused workspace and can evolve module by module.",
        lessons: ["Configuration matters when teams work differently", "Fast filtering reduces operational friction", "Documents are most useful when connected to the work context"],
      },
    },
    {
      title: "ASC GenScript",
      slug: "asc-genscript",
      category: "Tool" as ProjectCategory,
      year: "2026",
      role: "Product Designer / Builder",
      summary:
        "A productivity tool for generating SQL scripts and explaining spreadsheet-style formulas through interactive grid workflows.",
      contributions: [
        "SQL generation workflow",
        "Spreadsheet-like interaction design",
        "Formula Helper and data simulation concepts",
      ],
      technologies: ["JavaScript", "SQL", "Spreadsheet UX", "Web App"],
      featured: true,
      media: {
        icon: "GS",
        thumbnailUrl: "",
        thumbnailAlt: "ASC GenScript formula and SQL helper preview",
        assets: [
          { title: "Formula helper simulation", type: "Screenshot", url: "", caption: "Add a screenshot showing formula explanation or SQL generation output.", alt: "GenScript formula helper screenshot" },
        ],
      } as ProjectMedia,
      caseStudy: {
        context: "Repetitive SQL preparation and spreadsheet-style data manipulation can consume significant time during implementation and data-checking work.",
        problem: "Manual script composition is error-prone, while formula behavior can be difficult to explain when users only see the final result.",
        process: ["Identify repetitive SQL patterns", "Design spreadsheet-like grid interactions", "Build script-generation workflows", "Add interactive formula explanations and simulations"],
        solution: "Combine a fast data grid with guided SQL generation and visual formula explanations so common technical tasks require fewer manual steps.",
        result: "A reusable productivity-tool concept that makes script preparation and formula reasoning more accessible and repeatable.",
        lessons: ["Keyboard-first interaction matters for data-heavy work", "Generated output still needs transparent rules", "Visual simulation helps explain formulas better than static text"],
      },
    },
    {
      title: "MarketScope",
      slug: "marketscope",
      category: "Product" as ProjectCategory,
      year: "2026",
      role: "Product Designer / Builder",
      summary:
        "A spot-market analysis workspace for technical indicators, position analysis, portfolio risk and strategy profiles.",
      contributions: [
        "Analysis workflow and information architecture",
        "Spot position and portfolio-risk features",
        "Strategy profile product planning",
      ],
      technologies: ["Next.js", "Market Data", "Analytics", "Vercel"],
      featured: false,
      media: {
        icon: "MS",
        thumbnailUrl: "",
        thumbnailAlt: "MarketScope analysis workspace preview",
        assets: [] as MediaAsset[],
      } as ProjectMedia,
      caseStudy: {
        context: "Market analysis becomes difficult to act on when indicators, position information and risk views are separated.",
        problem: "Users need a clearer path from market data to spot-position decisions without mixing in futures-oriented workflows they do not use.",
        process: ["Structure indicator and market views", "Design spot entry and exit analysis", "Move position analysis into a dedicated module", "Add portfolio risk and strategy profiles"],
        solution: "Organize analysis around spot trading decisions, positions and portfolio risk with strategy profiles that make interpretation more consistent.",
        result: "A more focused analysis workspace with clearer separation between market overview, position management and strategy configuration.",
        lessons: ["Information architecture is as important as indicators", "User strategy should shape analysis output", "Avoid adding trading modes that do not match the intended user"],
      },
    },
    {
      title: "MyShop",
      slug: "myshop",
      category: "Product" as ProjectCategory,
      year: "2026",
      role: "Product Designer / Builder",
      summary:
        "A hybrid commerce concept supporting product CMS, direct checkout, affiliate redirects, order administration and customer accounts.",
      contributions: [
        "Commerce flow and CMS planning",
        "Checkout and order-management design",
        "Affiliate and direct-sale hybrid workflow",
      ],
      technologies: ["Next.js", "TypeScript", "Database", "Vercel"],
      featured: false,
      media: {
        icon: "SH",
        thumbnailUrl: "",
        thumbnailAlt: "MyShop commerce interface preview",
        assets: [] as MediaAsset[],
      } as ProjectMedia,
      caseStudy: {
        context: "A small commerce site may need both direct ordering and affiliate redirection depending on the product.",
        problem: "A single checkout model does not fit every product, while administrators still need one coherent way to manage products and direct orders.",
        process: ["Design product catalog and CMS", "Add guest direct checkout", "Build order administration", "Introduce affiliate and customer-account flows"],
        solution: "Use a hybrid commerce model where each product can follow either direct checkout or affiliate navigation while sharing the same storefront experience.",
        result: "A flexible product and order flow that supports different selling models without splitting the storefront into separate applications.",
        lessons: ["Commerce flows should be configurable per product", "Guest checkout reduces friction", "Admin workflows need to stay simple as customer features grow"],
      },
    },
    {
      title: "Family OS",
      slug: "family-os",
      category: "Product" as ProjectCategory,
      year: "2026",
      role: "Product Designer / Builder",
      summary:
        "A family operations workspace concept designed to centralize household information, routines and shared planning.",
      contributions: [
        "Product roadmap and modular structure",
        "Family-centered workflow design",
        "Production-ready architecture planning",
      ],
      technologies: ["Next.js", "Product Planning", "Responsive UI", "Vercel"],
      featured: false,
      media: {
        icon: "FO",
        thumbnailUrl: "",
        thumbnailAlt: "Family OS household workspace preview",
        assets: [] as MediaAsset[],
      } as ProjectMedia,
      caseStudy: {
        context: "Family information, routines and shared planning are often spread across notes, messages and separate apps.",
        problem: "Fragmentation makes it harder for a household to maintain one shared operational view without introducing unnecessary complexity.",
        process: ["Define a modular family workspace", "Prioritize an MVP roadmap", "Design responsive household workflows", "Plan the path from prototype to production-ready release"],
        solution: "Create a Family OS concept that centralizes shared planning and household information through focused modules that can be introduced progressively.",
        result: "A scalable product roadmap with a clear MVP foundation instead of attempting to build every family function at once.",
        lessons: ["Start from recurring household needs", "Keep modules independently useful", "Version discipline helps prevent scope confusion"],
      },
    },
  ],
  skillGroups: [
    {
      title: "Project & Business",
      skills: [
        "Project Management",
        "Functional Consulting",
        "Requirement Analysis",
        "Business Process Analysis",
        "Stakeholder Coordination",
        "UAT & Delivery",
      ],
    },
    {
      title: "Data & Validation",
      skills: ["SQL Server", "Data Validation", "Data Analysis", "Excel"],
    },
    {
      title: "Product & Technology",
      skills: ["JavaScript", "Next.js", "Git", "Vercel", "AI-assisted Development"],
    },
    {
      title: "Work Tools",
      skills: ["Jira", "GitHub", "VS Code", "Microsoft Office", "SQL Server"],
    },
  ],
  education: [] as Array<{
    period: string;
    institution: string;
    degree: string;
    note?: string;
  }>,
  certifications: [] as Array<{
    year: string;
    name: string;
    issuer: string;
    credentialUrl?: string;
  }>,
  workingProcess: [
    { index: "01", title: "Understand", text: "Clarify the business need, user context, constraints and measurable outcome." },
    { index: "02", title: "Analyze", text: "Break down processes, rules, dependencies, data and implementation risks." },
    { index: "03", title: "Design", text: "Translate findings into workflows, functional requirements and a practical solution." },
    { index: "04", title: "Coordinate", text: "Keep stakeholders aligned while development and testing move the solution forward." },
    { index: "05", title: "Validate", text: "Check functionality, data and real-world scenarios through review and UAT." },
    { index: "06", title: "Deliver", text: "Support rollout, resolve issues and improve the solution after implementation." },
  ],
  contact: {
    title: "Let's build something useful.",
    subtitle: "Have a project, role or idea to discuss?",
    description:
      "Send a short message with the context, goal and timeline. This form opens your email app, so no backend or database is required for this version.",
    responseNote: "Replace placeholder email and social links in src/data/profile.ts before publishing.",
    preferredTopics: [
      "Project opportunity",
      "Functional consulting",
      "Software implementation",
      "Product collaboration",
    ],
    methods: [
      {
        label: "Email",
        value: "hello@example.com",
        href: "mailto:hello@example.com",
        description: "Best for project briefs, role discussions and direct collaboration.",
      },
      {
        label: "LinkedIn",
        value: "Professional network",
        href: "#",
        description: "Use this for professional connection and background review.",
      },
      {
        label: "GitHub",
        value: "Product & source work",
        href: "#",
        description: "Browse product experiments, web apps and technical work.",
      },
    ],
  },
  social: { linkedin: "#", github: "#" },
} as const;

export type PortfolioProfile = typeof profile;
