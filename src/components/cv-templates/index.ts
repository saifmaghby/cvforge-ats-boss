export type CVTemplateId = "classic" | "minimal" | "modern" | "creative" | "executive";

export interface CVTemplateOption {
  id: CVTemplateId;
  name: string;
  description: string;
}

export const cvTemplates: CVTemplateOption[] = [
  { id: "classic", name: "Classic", description: "Industrial mono layout" },
  { id: "minimal", name: "Minimal", description: "Clean & restrained" },
  { id: "modern", name: "Modern", description: "Two-column with header" },
  { id: "creative", name: "Creative", description: "Bold sidebar layout" },
  { id: "executive", name: "Executive", description: "Centered & stately" },
];
