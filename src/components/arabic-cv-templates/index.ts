export type ArabicCVTemplateId = "arabic-classic" | "arabic-modern";

export interface ArabicCVTemplateOption {
  id: ArabicCVTemplateId;
  name: string;
  nameAr: string;
  description: string;
}

export const arabicCvTemplates: ArabicCVTemplateOption[] = [
  { id: "arabic-classic", name: "Classic Arabic", nameAr: "كلاسيكي", description: "تصميم أنيق وتقليدي" },
  { id: "arabic-modern", name: "Modern Arabic", nameAr: "عصري", description: "تصميم حديث بعمودين" },
];
