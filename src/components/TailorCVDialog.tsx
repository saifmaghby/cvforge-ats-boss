import { useState } from "react";
import { CVData } from "@/types/cv";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ForgeButton from "@/components/ForgeButton";
import { Wand2, Check, Plus, ArrowRight, Lightbulb, Loader2 } from "lucide-react";

interface TailoringResult {
  missingSkills: string[];
  suggestedSummary: string;
  bulletImprovements: { original: string; improved: string }[];
  titleSuggestion: string;
  tips: string[];
}

interface Props {
  data: CVData;
  onChange: (data: CVData) => void;
}

const TailorCVDialog = ({ data, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TailoringResult | null>(null);
  const [appliedSkills, setAppliedSkills] = useState<Set<string>>(new Set());
  const [appliedSummary, setAppliedSummary] = useState(false);
  const [appliedBullets, setAppliedBullets] = useState<Set<number>>(new Set());
  const [appliedTitle, setAppliedTitle] = useState(false);

  const analyze = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description first");
      return;
    }
    setLoading(true);
    setResult(null);
    setAppliedSkills(new Set());
    setAppliedSummary(false);
    setAppliedBullets(new Set());
    setAppliedTitle(false);

    try {
      const { data: res, error } = await supabase.functions.invoke("tailor-cv", {
        body: { cvData: data, jobDescription },
      });
      if (error) throw error;
      if (res?.error) throw new Error(res.error);
      setResult(res);
      toast.success("Tailoring suggestions ready!");
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze");
    } finally {
      setLoading(false);
    }
  };

  const applySkill = (skill: string) => {
    if (appliedSkills.has(skill)) return;
    onChange({ ...data, skills: [...data.skills, skill] });
    setAppliedSkills((prev) => new Set(prev).add(skill));
    toast.success(`Added "${skill}" to skills`);
  };

  const applyAllSkills = () => {
    if (!result) return;
    const newSkills = result.missingSkills.filter((s) => !appliedSkills.has(s));
    onChange({ ...data, skills: [...data.skills, ...newSkills] });
    setAppliedSkills(new Set(result.missingSkills));
    toast.success(`Added ${newSkills.length} skills`);
  };

  const applySummary = () => {
    if (!result) return;
    onChange({ ...data, summary: result.suggestedSummary });
    setAppliedSummary(true);
    toast.success("Summary updated");
  };

  const applyBullet = (idx: number) => {
    if (!result || appliedBullets.has(idx)) return;
    const imp = result.bulletImprovements[idx];
    const newExp = data.experience.map((exp) => ({
      ...exp,
      bullets: exp.bullets.map((b) => (b === imp.original ? imp.improved : b)),
    }));
    onChange({ ...data, experience: newExp });
    setAppliedBullets((prev) => new Set(prev).add(idx));
    toast.success("Bullet updated");
  };

  const applyTitle = () => {
    if (!result?.titleSuggestion) return;
    onChange({
      ...data,
      personal: { ...data.personal, title: result.titleSuggestion },
    });
    setAppliedTitle(true);
    toast.success("Title updated");
  };

  const labelClass = "text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-2 block";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ForgeButton variant="ghost" className="gap-1.5">
          <Wand2 className="w-3.5 h-3.5" />
          Tailor to JD
        </ForgeButton>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl uppercase tracking-tight">
            Tailor CV to Job Description
          </DialogTitle>
        </DialogHeader>

        {/* JD Input */}
        <div className="mt-2">
          <label className={labelClass}>Paste Job Description</label>
          <textarea
            className="w-full bg-transparent border border-border focus:border-primary outline-none p-3 text-foreground font-mono text-sm transition-colors min-h-[120px] resize-y placeholder:text-muted-foreground/50"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            disabled={loading}
          />
          <ForgeButton
            variant="primary"
            className="mt-3 w-full"
            onClick={analyze}
            disabled={loading || !jobDescription.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Analyze & Suggest
              </>
            )}
          </ForgeButton>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-6">
            {/* Missing Skills */}
            {result.missingSkills.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>Missing Keywords / Skills</label>
                  <button
                    onClick={applyAllSkills}
                    className="text-[10px] font-mono uppercase tracking-widest text-primary hover:text-foreground transition-colors"
                  >
                    + Add All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((skill) => {
                    const applied = appliedSkills.has(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => applySkill(skill)}
                        disabled={applied}
                        className={`px-3 py-1.5 text-xs font-mono border transition-all ${
                          applied
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border hover:border-primary text-foreground hover:bg-primary/5"
                        }`}
                      >
                        {applied ? (
                          <Check className="w-3 h-3 inline mr-1" />
                        ) : (
                          <Plus className="w-3 h-3 inline mr-1" />
                        )}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Title Suggestion */}
            {result.titleSuggestion && (
              <div>
                <label className={labelClass}>Suggested Title</label>
                <div className="border border-border p-3 flex items-center justify-between">
                  <div className="font-mono text-sm">
                    <span className="text-muted-foreground line-through mr-3">{data.personal.title}</span>
                    <ArrowRight className="w-3 h-3 inline mx-2 text-muted-foreground" />
                    <span className="text-foreground">{result.titleSuggestion}</span>
                  </div>
                  <button
                    onClick={applyTitle}
                    disabled={appliedTitle}
                    className={`text-[10px] font-mono uppercase tracking-widest transition-colors ${
                      appliedTitle ? "text-primary" : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {appliedTitle ? "Applied ✓" : "Apply"}
                  </button>
                </div>
              </div>
            )}

            {/* Summary */}
            <div>
              <label className={labelClass}>Tailored Summary</label>
              <div className="border border-border p-3">
                <p className="font-mono text-sm text-foreground/80 leading-relaxed">
                  {result.suggestedSummary}
                </p>
                <button
                  onClick={applySummary}
                  disabled={appliedSummary}
                  className={`mt-3 text-[10px] font-mono uppercase tracking-widest transition-colors ${
                    appliedSummary ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {appliedSummary ? "Applied ✓" : "Apply this summary"}
                </button>
              </div>
            </div>

            {/* Bullet Improvements */}
            {result.bulletImprovements.length > 0 && (
              <div>
                <label className={labelClass}>Bullet Improvements</label>
                <div className="space-y-3">
                  {result.bulletImprovements.map((imp, i) => {
                    const applied = appliedBullets.has(i);
                    return (
                      <div key={i} className="border border-border p-3">
                        <p className="font-mono text-xs text-muted-foreground line-through mb-2">
                          {imp.original}
                        </p>
                        <p className="font-mono text-sm text-foreground">
                          {imp.improved}
                        </p>
                        <button
                          onClick={() => applyBullet(i)}
                          disabled={applied}
                          className={`mt-2 text-[10px] font-mono uppercase tracking-widest transition-colors ${
                            applied ? "text-primary" : "text-muted-foreground hover:text-primary"
                          }`}
                        >
                          {applied ? "Applied ✓" : "Apply"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tips */}
            {result.tips.length > 0 && (
              <div>
                <label className={labelClass}>Additional Tips</label>
                <div className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 font-mono text-sm text-foreground/70">
                      <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TailorCVDialog;
