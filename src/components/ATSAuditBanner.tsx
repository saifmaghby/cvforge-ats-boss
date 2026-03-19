import { useState } from "react";
import { X, TrendingUp, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import ATSScoreGauge from "@/components/ATSScoreGauge";

export interface ATSAuditData {
  overallScore: number;
  scores: {
    contentQuality: number;
    keywordRichness: number;
    formatting: number;
    completeness: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
}

const ATSAuditBanner = ({ audit, onDismiss }: { audit: ATSAuditData; onDismiss: () => void }) => {
  const [expanded, setExpanded] = useState(false);

  const scoreColor = (s: number) =>
    s >= 75 ? "text-primary" : s >= 50 ? "text-yellow-500" : "text-destructive";

  return (
    <div className="border border-border bg-muted/30 mx-4 mt-3 mb-1">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Original CV ATS Audit
            </span>
          </div>
          <span className={`font-display text-2xl font-bold ${scoreColor(audit.overallScore)}`}>
            {audit.overallScore}/100
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            {expanded ? "Less" : "Details"}
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="px-4 pb-3">
        <p className="text-xs font-mono text-muted-foreground">{audit.summary}</p>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {/* Sub-scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Content", value: audit.scores.contentQuality },
              { label: "Keywords", value: audit.scores.keywordRichness },
              { label: "Formatting", value: audit.scores.formatting },
              { label: "Completeness", value: audit.scores.completeness },
            ].map((s) => (
              <div key={s.label} className="text-center border border-border p-2">
                <span className={`font-display text-lg font-bold ${scoreColor(s.value)}`}>{s.value}</span>
                <span className="block text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Strengths
              </h4>
              <ul className="space-y-1">
                {audit.strengths.map((s, i) => (
                  <li key={i} className="text-xs font-mono text-muted-foreground">• {s}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Weaknesses
              </h4>
              <ul className="space-y-1">
                {audit.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs font-mono text-muted-foreground">• {w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Suggestions for Improvement
            </h4>
            <ul className="space-y-1">
              {audit.suggestions.map((s, i) => (
                <li key={i} className="text-xs font-mono text-muted-foreground">→ {s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSAuditBanner;
