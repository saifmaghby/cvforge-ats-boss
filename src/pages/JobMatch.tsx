import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import ForgeButton from "@/components/ForgeButton";
import ATSScoreGauge from "@/components/ATSScoreGauge";
import { normalizeCVData } from "@/types/cv";
import { Loader2, Search, CheckCircle, XCircle, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface MatchResult {
  matchScore: number;
  verdict: string;
  scores: { skillsMatch: number; experienceMatch: number; educationMatch: number; keywordsMatch: number };
  matchedSkills: string[];
  missingSkills: string[];
  gaps: string[];
  emphasize: string[];
  suggestions: string[];
  summary: string;
}

const JobMatch = () => {
  const { user } = useAuth();
  const [savedCVs, setSavedCVs] = useState<{ id: string; name: string; cv_data: any }[]>([]);
  const [selectedCV, setSelectedCV] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("saved_cvs").select("id, name, cv_data").order("updated_at", { ascending: false })
      .then(({ data }) => { if (data) setSavedCVs(data); });
  }, [user]);

  const handleAnalyze = async () => {
    if (!selectedCV || !jobDescription.trim()) { toast.error("Select a CV and paste a job description"); return; }
    setLoading(true);
    setResult(null);
    try {
      const cv = savedCVs.find((c) => c.id === selectedCV);
      const cvData = normalizeCVData(cv?.cv_data);
      const { data, error } = await supabase.functions.invoke("job-match", {
        body: { cvData, jobDescription },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s: number) =>
    s >= 75 ? "text-primary" : s >= 50 ? "text-yellow-500" : "text-destructive";

  const verdictColor = (v: string) => {
    if (v.includes("Strong")) return "text-primary";
    if (v.includes("Moderate")) return "text-yellow-500";
    return "text-destructive";
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight">
            Job <span className="text-primary">Match</span> Finder
          </h1>
          <p className="text-sm font-mono text-muted-foreground mt-1">
            See how well your CV matches a specific job and get tailored suggestions
          </p>
        </div>

        {/* Setup */}
        <div className="border border-border p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Select CV</label>
            <select
              value={selectedCV}
              onChange={(e) => setSelectedCV(e.target.value)}
              className="w-full border border-border bg-background text-foreground font-mono text-sm p-2 focus:border-primary outline-none"
            >
              <option value="">Choose a saved CV…</option>
              {savedCVs.map((cv) => (
                <option key={cv.id} value={cv.id}>{cv.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here…"
              rows={6}
              className="w-full border border-border bg-background text-foreground font-mono text-sm p-3 focus:border-primary outline-none resize-none"
            />
          </div>

          <ForgeButton variant="primary" onClick={handleAnalyze} disabled={loading || !selectedCV || !jobDescription.trim()}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing…</> : <><Search className="h-4 w-4 mr-2" /> Analyze Match</>}
          </ForgeButton>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-5">
            {/* Score & Verdict */}
            <div className="border border-border p-6 flex flex-col md:flex-row items-center gap-6">
              <ATSScoreGauge score={result.matchScore} />
              <div className="flex-1 space-y-3">
                <span className={`font-display text-xl font-bold uppercase ${verdictColor(result.verdict)}`}>
                  {result.verdict}
                </span>
                <p className="text-sm font-mono text-muted-foreground">{result.summary}</p>

                {/* Sub-scores */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Skills", value: result.scores.skillsMatch },
                    { label: "Experience", value: result.scores.experienceMatch },
                    { label: "Education", value: result.scores.educationMatch },
                    { label: "Keywords", value: result.scores.keywordsMatch },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between border border-border px-3 py-1.5">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{s.label}</span>
                      <span className={`font-display text-sm font-bold ${scoreColor(s.value)}`}>{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border p-4 space-y-2">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5" /> Matched Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedSkills.map((s, i) => (
                    <span key={i} className="text-[10px] font-mono border border-primary/30 text-primary px-2 py-0.5">{s}</span>
                  ))}
                </div>
              </div>
              <div className="border border-border p-4 space-y-2">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-destructive flex items-center gap-2"><XCircle className="h-3.5 w-3.5" /> Missing Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.map((s, i) => (
                    <span key={i} className="text-[10px] font-mono border border-destructive/30 text-destructive px-2 py-0.5">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Gaps */}
            <div className="border border-border p-4 space-y-2">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5" /> Key Gaps</h3>
              <ul className="space-y-1.5">
                {result.gaps.map((g, i) => (
                  <li key={i} className="text-xs font-mono text-muted-foreground">⚠ {g}</li>
                ))}
              </ul>
            </div>

            {/* Emphasize & Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border p-4 space-y-2">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Emphasize</h3>
                <ul className="space-y-1.5">
                  {result.emphasize.map((e, i) => (
                    <li key={i} className="text-xs font-mono text-muted-foreground">★ {e}</li>
                  ))}
                </ul>
              </div>
              <div className="border border-border p-4 space-y-2">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5" /> Suggestions</h3>
                <ul className="space-y-1.5">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="text-xs font-mono text-muted-foreground">→ {s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobMatch;
