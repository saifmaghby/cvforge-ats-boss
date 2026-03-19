export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  photoUrl?: string;
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

const createId = (prefix: string, index: number) => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${prefix}-${index}`;
};

export const normalizeCVData = (value: unknown): CVData => {
  const raw = (value && typeof value === "object" ? value : {}) as Partial<CVData> & {
    personal?: Partial<PersonalInfo>;
    experience?: Partial<Experience>[];
    education?: Partial<Education>[];
  };

  return {
    personal: {
      ...emptyCVData.personal,
      ...(raw.personal && typeof raw.personal === "object" ? raw.personal : {}),
    },
    summary: typeof raw.summary === "string" ? raw.summary : emptyCVData.summary,
    experience: Array.isArray(raw.experience)
      ? raw.experience.map((item, index) => ({
          id: typeof item?.id === "string" && item.id ? item.id : createId("experience", index),
          company: typeof item?.company === "string" ? item.company : "",
          role: typeof item?.role === "string" ? item.role : "",
          startDate: typeof item?.startDate === "string" ? item.startDate : "",
          endDate: typeof item?.endDate === "string" ? item.endDate : "",
          current: Boolean(item?.current),
          bullets: Array.isArray(item?.bullets)
            ? item.bullets.filter((bullet): bullet is string => typeof bullet === "string")
            : [""],
        }))
      : emptyCVData.experience,
    education: Array.isArray(raw.education)
      ? raw.education.map((item, index) => ({
          id: typeof item?.id === "string" && item.id ? item.id : createId("education", index),
          institution: typeof item?.institution === "string" ? item.institution : "",
          degree: typeof item?.degree === "string" ? item.degree : "",
          startDate: typeof item?.startDate === "string" ? item.startDate : "",
          endDate: typeof item?.endDate === "string" ? item.endDate : "",
        }))
      : emptyCVData.education,
    skills: Array.isArray(raw.skills)
      ? raw.skills.filter((skill): skill is string => typeof skill === "string")
      : emptyCVData.skills,
  };
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
