import { useEffect, useState } from "react";

const ATSScoreGauge = ({ score = 0 }: { score?: number }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getGrade = (s: number) => {
    if (s >= 90) return { label: "Excellent", color: "hsl(var(--primary))" };
    if (s >= 75) return { label: "Good", color: "hsl(var(--primary))" };
    if (s >= 50) return { label: "Needs Work", color: "hsl(40 100% 55%)" };
    return { label: "Poor", color: "hsl(var(--destructive))" };
  };

  const grade = getGrade(score);

  return (
    <div className="relative inline-flex flex-col items-center justify-center gap-3">
      <svg width="160" height="160" viewBox="0 0 100 100" className="-rotate-90">
        {/* Track */}
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="3"
        />
        {/* Tick marks */}
        {Array.from({ length: 40 }).map((_, i) => {
          const angle = (i / 40) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const x1 = 50 + 40 * Math.cos(rad);
          const y1 = 50 + 40 * Math.sin(rad);
          const x2 = 50 + 42.5 * Math.cos(rad);
          const y2 = 50 + 42.5 * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={i % 10 === 0 ? "hsl(var(--muted-foreground))" : "hsl(var(--border))"}
              strokeWidth={i % 10 === 0 ? "0.8" : "0.4"}
            />
          );
        })}
        {/* Progress arc */}
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke={grade.color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="butt"
          className="transition-all duration-[1500ms] ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${grade.color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-4xl font-bold text-foreground leading-none">
          {Math.round(animatedScore)}
        </span>
        <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-muted-foreground mt-1">
          ATS Score
        </span>
      </div>
      <span
        className="text-[10px] font-mono uppercase tracking-widest font-semibold"
        style={{ color: grade.color }}
      >
        {grade.label}
      </span>
    </div>
  );
};

export default ATSScoreGauge;
