export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface CVData {
  personal: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export const emptyCVData: CVData = {
  personal: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
};

export const sampleCVData: CVData = {
  personal: {
    fullName: "Ahmed Hassan",
    title: "Senior Software Engineer",
    email: "ahmed.hassan@email.com",
    phone: "+20 100 XXX XXXX",
    location: "Cairo, Egypt",
    linkedin: "linkedin.com/in/ahmedhassan",
  },
  summary:
    "Results-driven software engineer with 7+ years of experience in full-stack development, microservices architecture, and team leadership across multinational environments.",
  experience: [
    {
      id: "1",
      company: "Vodafone Egypt",
      role: "Senior Engineer",
      startDate: "2021",
      endDate: "",
      current: true,
      bullets: [
        "Orchestrated migration of legacy monolith to microservices, reducing deployment time by 73%",
        "Led cross-functional squad of 8 engineers delivering real-time billing platform",
      ],
    },
    {
      id: "2",
      company: "Valeo Egypt",
      role: "Software Engineer",
      startDate: "2018",
      endDate: "2021",
      current: false,
      bullets: [
        "Engineered embedded dashboard systems processing 2M+ data points daily",
        "Implemented CI/CD pipeline reducing release cycles from 2 weeks to 2 days",
      ],
    },
  ],
  education: [
    {
      id: "1",
      institution: "Cairo University",
      degree: "BSc Computer Engineering",
      startDate: "2014",
      endDate: "2018",
    },
  ],
  skills: [
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "AWS",
    "Docker",
    "Kubernetes",
    "PostgreSQL",
    "Redis",
    "GraphQL",
  ],
};
