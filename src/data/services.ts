export type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
  tags: string[];
};

export const services: Service[] = [
  {
    id: "grasshopper",
    title: "Grasshopper & Parametric Design",
    description:
      "Advanced parametric design for architecture, engineering, and fabrication. Automating complex geometries and optimizing forms through algorithmic workflows.",
    icon: "Workflow",
    tags: ["Rhino", "Grasshopper", "Parametric"],
  },
  {
    id: "consulting",
    title: "Specialized Consulting",
    description:
      "Strategic advisory for implementing computational design technologies in your workflow. Diagnosis, roadmap definition, and hands-on accompaniment.",
    icon: "MessageSquare",
    tags: ["Strategy", "Advisory"],
  },
  {
    id: "bim",
    title: "BIM & Digital Modeling",
    description:
      "Implementation and management of BIM workflows for architecture and infrastructure projects. Interoperability and ISO 19650 standards compliance.",
    icon: "Building2",
    tags: ["Revit", "IFC", "ISO 19650"],
  },
  {
    id: "automation",
    title: "Automation Workflows",
    description:
      "Custom scripts and pipelines that eliminate repetitive tasks and connect design, analysis, and documentation tools into seamless automated flows.",
    icon: "Zap",
    tags: ["Python", "Dynamo", "Scripts"],
  },
  {
    id: "cloud-apps",
    title: "Cloud-Based Web Apps",
    description:
      "Cloud applications for 3D visualization, model management, project dashboards, and real-time collaboration across distributed teams.",
    icon: "Cloud",
    tags: ["Web", "Three.js", "React"],
  },
  {
    id: "ui",
    title: "UI & Product Design",
    description:
      "User interfaces for technical tools, engineering dashboards, and AEC applications. Design centered on professional workflow efficiency.",
    icon: "Palette",
    tags: ["Figma", "UX", "Design Systems"],
  },
  {
    id: "inhouse-tools",
    title: "In-House Tools",
    description:
      "Bespoke proprietary tools built for your company — from specialized scripts to full desktop applications tailored to your exact process.",
    icon: "Wrench",
    tags: ["Custom Dev", "Internal Tools"],
  },
  {
    id: "plugins",
    title: "Plugins & Add-ons",
    description:
      "Custom extensions for Rhino, Revit, Grasshopper, and other platforms. Expand the capabilities of the tools your team already relies on.",
    icon: "Puzzle",
    tags: ["Rhino API", "Revit API", "C#"],
  },
  {
    id: "machine-learning",
    title: "Machine Learning",
    description:
      "Predictive models for design optimization, structural and energy analysis, and performance simulation. Data in service of better projects.",
    icon: "BrainCircuit",
    tags: ["Python", "TensorFlow", "Data"],
  },
  {
    id: "ai",
    title: "AI Integration",
    description:
      "Integration of language and computer vision models into AEC workflows. Automated generation, analysis, and classification of design data.",
    icon: "Cpu",
    tags: ["LLMs", "Computer Vision", "APIs"],
  },
  {
    id: "ai-agents",
    title: "AI Agents",
    description:
      "Design and deployment of autonomous agents to coordinate design tasks, documentation review, and project management across your team.",
    icon: "Bot",
    tags: ["Autonomous", "Agentic AI", "MCP"],
  },
];
