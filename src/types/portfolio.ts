export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  liveUrl: string;
  repoUrl: string;
}

export interface PortfolioData {
  hero: {
    name: string;
    title: string;
    tagline: string;
    avatarUrl: string;
  };
  about: string;
  projects: PortfolioProject[];
  skills: string[];
  contact: {
    email: string;
    linkedin: string;
    github: string;
    website: string;
  };
}

export type PortfolioTemplate = "developer" | "designer" | "minimal";

export const emptyPortfolioData: PortfolioData = {
  hero: { name: "", title: "", tagline: "", avatarUrl: "" },
  about: "",
  projects: [],
  skills: [],
  contact: { email: "", linkedin: "", github: "", website: "" },
};

export const samplePortfolioData: PortfolioData = {
  hero: {
    name: "Sarah Chen",
    title: "Full-Stack Developer",
    tagline: "Building fast, accessible products with modern web technologies.",
    avatarUrl: "",
  },
  about:
    "I'm a developer with 5+ years of experience building web applications. I focus on React, TypeScript, and Node.js, and I love creating tools that make people's lives easier. Currently open to freelance and full-time opportunities.",
  projects: [
    {
      id: "1",
      title: "TaskFlow",
      description: "A real-time project management app with Kanban boards, team collaboration, and analytics dashboards.",
      imageUrl: "",
      tags: ["React", "TypeScript", "Supabase", "Tailwind"],
      liveUrl: "https://taskflow.app",
      repoUrl: "https://github.com/sarahchen/taskflow",
    },
    {
      id: "2",
      title: "FinTrack",
      description: "Personal finance tracker with expense categorization, budget planning, and interactive charts.",
      imageUrl: "",
      tags: ["Next.js", "PostgreSQL", "Chart.js"],
      liveUrl: "",
      repoUrl: "https://github.com/sarahchen/fintrack",
    },
  ],
  skills: ["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "AWS", "Docker", "Figma", "Git", "GraphQL"],
  contact: {
    email: "sarah@example.com",
    linkedin: "linkedin.com/in/sarahchen",
    github: "github.com/sarahchen",
    website: "",
  },
};
