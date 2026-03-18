import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ForgeButton from "@/components/ForgeButton";
import ATSScoreGauge from "@/components/ATSScoreGauge";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { AlertTriangle, Check, X, Zap } from "lucide-react";

interface ATSResult {
  overallScore: number;
  keywordMatchPercent: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  formattingIssues: string[];
  suggestions: string[];
  summary: string;
}

const ATSChecker = () => {
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  const runAudit = async () => {
    if (!cvText.trim() || !jobDescription.trim()) {
      toast.error("Paste both your CV text and the job description.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ats-checker", {
        body: { cvText, jobDescription },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setResult(data as ATSResult);
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 p-6 lg:p-10 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-2">
            Parser Simulation
          </p>
          <h1 className="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tighter">
            ATS Score Checker
          </h1>
          <p className="text-sm font-mono text-muted-foreground mt-2 max-w-lg">
            Paste your CV text and a job description. Our AI simulates how Wuzzuf, Bayt, and LinkedIn parsers read your CV.
          </p>
        </div>

        {/* Input section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mb-8">
          <div className="border border-border p-6">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-primary mb-3">
              Your CV Text
            </label>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              className="w-full h-64 bg-transparent border border-border focus:border-primary outline-none p-3 text-sm font-mono text-foreground transition-colors duration-75 resize-none placeholder:text-muted-foreground/40"
              placeholder="Paste your CV content here (plain text)..."
            />
          </div>
          <div className="border border-border border-t-0 lg:border-t lg:border-l-0 p-6">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-primary mb-3">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full h-64 bg-transparent border border-border focus:border-primary outline-none p-3 text-sm font-mono text-foreground transition-colors duration-75 resize-none placeholder:text-muted-foreground/40"
              placeholder="Paste the job description here..."
            />
          </div>
        </div>

        <div className="mb-12">
          <ForgeButton size="lg" onClick={runAudit} className="w-full sm:w-auto">
            {loading ? "Analyzing..." : "Initialize Audit"}
          </ForgeButton>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="border border-border p-8">
            <div className="flex items-center gap-4">
              <div className="h-1 flex-1 bg-secondary overflow-hidden">
                <div className="h-full bg-primary animate-pulse" style={{ width: "75%" }} />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Running Parser Simulation...
              </span>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
              <div className="p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border">
                <ATSScoreGauge score={result.overallScore} />
              </div>
              <div className="p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  Keyword Match
                </p>
                <p className="font-display text-4xl font-bold">
                  {result.keywordMatchPercent}
                  <span className="text-lg text-muted-foreground">%</span>
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  {result.matchedKeywords.length} matched · {result.missingKeywords.length} missing
                </p>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Summary
                </p>
                <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                  {result.summary}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="border border-border border-t-0 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-primary">
                    Matched Keywords
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.matchedKeywords.map((kw) => (
                    <span key={kw} className="border border-primary/30 bg-primary/5 text-primary px-2 py-1 text-xs font-mono">
                      {kw}
                    </span>
                  ))}
                  {result.matchedKeywords.length === 0 && (
                    <span className="text-xs font-mono text-muted-foreground">None detected</span>
                  )}
                </div>
              </div>
              <div className="border border-border border-t-0 md:border-l-0 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <X className="w-4 h-4 text-destructive" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-destructive">
                    Missing Keywords
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((kw) => (
                    <span key={kw} className="border border-destructive/30 bg-destructive/5 text-destructive px-2 py-1 text-xs font-mono">
                      {kw}
                    </span>
                  ))}
                  {result.missingKeywords.length === 0 && (
                    <span className="text-xs font-mono text-muted-foreground">None — great coverage!</span>
                  )}
                </div>
              </div>
            </div>

            {result.formattingIssues.length > 0 && (
              <div className="border border-border border-t-0 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-destructive">
                    Formatting Issues
                  </p>
                </div>
                <ul className="space-y-2">
                  {result.formattingIssues.map((issue, i) => (
                    <li key={i} className="text-sm font-mono text-muted-foreground flex items-start gap-2">
                      <span className="text-destructive mt-0.5">▸</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border border-border border-t-0 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-primary" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-primary">
                  Optimization Suggestions
                </p>
              </div>
              <ul className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-sm font-mono text-foreground flex items-start gap-3">
                    <span className="text-primary font-bold">{String(i + 1).padStart(2, "0")}</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ATSChecker;
