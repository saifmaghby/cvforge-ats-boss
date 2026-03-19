import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: cvCount = 0 } = useQuery({
    queryKey: ["cv-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("saved_cvs").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: portfolioCount = 0 } = useQuery({
    queryKey: ["portfolio-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("portfolios").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: jobCount = 0 } = useQuery({
    queryKey: ["job-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("job_applications").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
    enabled: !!user,
  });

  const cards = [
    { title: "My CVs", desc: "Build and manage your ATS-optimized CVs", count: cvCount, url: "/my-cvs" },
    { title: "Portfolios", desc: "Showcase your work with stunning portfolios", count: portfolioCount, url: "/portfolios" },
    { title: "Job Tracker", desc: "Track applications and interview status", count: jobCount, url: "/job-tracker" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-2">
          Command Center
        </p>
        <h1 className="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tighter mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={() => navigate(card.url)}
              className="border border-border p-8 hover:bg-secondary transition-colors cursor-pointer"
            >
              <span className="font-display text-3xl font-bold text-muted-foreground">{card.count}</span>
              <h3 className="font-display text-lg font-bold uppercase tracking-tight mt-2 mb-1">
                {card.title}
              </h3>
              <p className="text-sm font-mono text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
