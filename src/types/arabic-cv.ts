export interface ArabicPersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  photoUrl?: string;
}

export interface ArabicExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface ArabicEducation {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface ArabicCVData {
  personal: ArabicPersonalInfo;
  summary: string;
  experience: ArabicExperience[];
  education: ArabicEducation[];
  skills: string[];
}

export const emptyArabicCVData: ArabicCVData = {
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

export const sampleArabicCVData: ArabicCVData = {
  personal: {
    fullName: "أحمد حسن محمد",
    title: "مهندس برمجيات أول",
    email: "ahmed.hassan@email.com",
    phone: "+20 100 XXX XXXX",
    location: "القاهرة، مصر",
    linkedin: "linkedin.com/in/ahmedhassan",
  },
  summary:
    "مهندس برمجيات ذو خبرة تزيد عن 7 سنوات في تطوير التطبيقات الكاملة، وبنية الخدمات المصغرة، وقيادة الفرق التقنية في بيئات متعددة الجنسيات.",
  experience: [
    {
      id: "1",
      company: "فودافون مصر",
      role: "مهندس أول",
      startDate: "2021",
      endDate: "",
      current: true,
      bullets: [
        "قاد عملية ترحيل النظام القديم إلى بنية خدمات مصغرة مما أدى لتقليل وقت النشر بنسبة 73%",
        "قاد فريقاً متعدد التخصصات مكوناً من 8 مهندسين لتطوير منصة فواتير فورية",
      ],
    },
    {
      id: "2",
      company: "فاليو مصر",
      role: "مهندس برمجيات",
      startDate: "2018",
      endDate: "2021",
      current: false,
      bullets: [
        "طوّر أنظمة لوحات معلومات مدمجة تعالج أكثر من 2 مليون نقطة بيانات يومياً",
        "نفّذ خط أنابيب CI/CD مما أدى لتقليل دورات الإصدار من أسبوعين إلى يومين",
      ],
    },
  ],
  education: [
    {
      id: "1",
      institution: "جامعة القاهرة",
      degree: "بكالوريوس هندسة الحاسبات",
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

export const normalizeArabicCVData = (value: unknown): ArabicCVData => {
  const raw = (value && typeof value === "object" ? value : {}) as Partial<ArabicCVData> & {
    personal?: Partial<ArabicPersonalInfo>;
    experience?: Partial<ArabicExperience>[];
    education?: Partial<ArabicEducation>[];
  };

  return {
    personal: {
      ...emptyArabicCVData.personal,
      ...(raw.personal && typeof raw.personal === "object" ? raw.personal : {}),
    },
    summary: typeof raw.summary === "string" ? raw.summary : "",
    experience: Array.isArray(raw.experience)
      ? raw.experience.map((item, index) => ({
          id: typeof item?.id === "string" && item.id ? item.id : crypto.randomUUID(),
          company: typeof item?.company === "string" ? item.company : "",
          role: typeof item?.role === "string" ? item.role : "",
          startDate: typeof item?.startDate === "string" ? item.startDate : "",
          endDate: typeof item?.endDate === "string" ? item.endDate : "",
          current: Boolean(item?.current),
          bullets: Array.isArray(item?.bullets)
            ? item.bullets.filter((b): b is string => typeof b === "string")
            : [""],
        }))
      : [],
    education: Array.isArray(raw.education)
      ? raw.education.map((item, index) => ({
          id: typeof item?.id === "string" && item.id ? item.id : crypto.randomUUID(),
          institution: typeof item?.institution === "string" ? item.institution : "",
          degree: typeof item?.degree === "string" ? item.degree : "",
          startDate: typeof item?.startDate === "string" ? item.startDate : "",
          endDate: typeof item?.endDate === "string" ? item.endDate : "",
        }))
      : [],
    skills: Array.isArray(raw.skills)
      ? raw.skills.filter((s): s is string => typeof s === "string")
      : [],
  };
};
