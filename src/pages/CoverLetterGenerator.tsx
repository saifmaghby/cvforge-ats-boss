import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ForgeButton from "@/components/ForgeButton";
import { CVData, sampleCVData, emptyCVData } from "@/types/cv";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Sparkles, Copy, Download } from "lucide-react";

type Tone = "professional" | "confident" | "formal" | "conversational";

const tones: { id: Tone; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "confident", label: "Confident" },
  { id: "formal", label: "Formal" },
  { id: "conversational", label: "Conversational" },
];

const labelClass = "block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1";
const inputClass =
  "w-full bg-transparent border border-border focus:border-primary outline-none py-2 px-3 text-foreground font-mono text-sm transition-colors placeholder:text-muted-foreground/50";

const CoverLetterGenerator = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [coverLetter, setCoverLetter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [useCustomCV, setUseCustomCV] = useState(false);
  const [cvSource, setCvSource] = useState<"sample" | "empty">("sample");

  // For now we use sample data; later this integrates with saved CVs
  const cvData: CVData = cvSource === "sample" ? sampleCVData : emptyCVData;

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description");
      return;
    }

    setGenerating(true);
    setCoverLetter("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-cover-letter", {
        body: { cvData, jobDescription, companyName, tone },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setCoverLetter(data.coverLetter);
      toast.success("Cover letter generated");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to generate cover letter");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coverLetter);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cover_Letter${companyName ? `_${companyName.replace(/\s+/g, "_")}` : ""}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="border-b border-border px-4 h-12 flex items-center justify-between bg-background">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Cover Letter Generator
        </span>
        {coverLetter && (
          <div className="flex items-center gap-2">
            <ForgeButton variant="ghost" onClick={handleCopy}>
              <Copy className="w-3 h-3 mr-1.5" /> Copy
            </ForgeButton>
            <ForgeButton variant="ghost" onClick={handleDownload}>
              <Download className="w-3 h-3 mr-1.5" /> Download
            </ForgeButton>
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2" style={{ height: "calc(100vh - 7.5rem)" }}>
        {/* Input Panel */}
        <div className="h-full overflow-auto p-6 lg:p-8 space-y-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">Step 01</p>
            <h3 className="font-display text-xl font-bold uppercase tracking-tight">Job Details</h3>
          </div>

          <div>
            <label className={labelClass}>Company Name (optional)</label>
            <input
              className={inputClass}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Vodafone Egypt"
            />
          </div>

          <div>
            <label className={labelClass}>Job Description</label>
            <textarea
              className={`${inputClass} min-h-[160px] resize-y`}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
            />
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">Step 02</p>
            <h3 className="font-display text-xl font-bold uppercase tracking-tight mb-3">Tone</h3>
            <div className="flex gap-1 flex-wrap">
              {tones.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider border transition-colors ${
                    tone === t.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">Step 03</p>
            <h3 className="font-display text-xl font-bold uppercase tracking-tight mb-3">CV Data</h3>
            <p className="text-xs font-mono text-muted-foreground mb-3">
              Using sample CV data. Build your CV in the CV Builder for personalized results.
            </p>
          </div>

          <ForgeButton
            variant="primary"
            className="w-full justify-center"
            onClick={handleGenerate}
            disabled={generating || !jobDescription.trim()}
          >
            {generating ? (
              <>Generating…</>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" /> Generate Cover Letter
              </>
            )}
          </ForgeButton>
        </div>

        {/* Output Panel */}
        <div className="hidden lg:block h-full overflow-auto border-l border-border bg-secondary p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-primary" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Generated Output
            </span>
          </div>

          {coverLetter ? (
            <div className="border border-border bg-white text-black p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {coverLetter}
            </div>
          ) : (
            <div className="border border-border bg-background/50 flex flex-col items-center justify-center p-12 text-center" style={{ minHeight: "60vh" }}>
              <FileText className="w-8 h-8 text-muted-foreground/30 mb-4" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {generating ? "AI is crafting your cover letter…" : "Paste a job description and generate"}
              </p>
              {generating && (
                <div className="mt-4 w-32 h-0.5 bg-border overflow-hidden">
                  <div className="h-full bg-primary animate-pulse" style={{ width: "60%" }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoverLetterGenerator;
