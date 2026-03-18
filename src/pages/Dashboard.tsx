import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
          {[
            { title: "My CVs", desc: "Build and manage your ATS-optimized CVs", count: "0", url: "/my-cvs" },
            { title: "ATS Checker", desc: "Audit your CV against job descriptions", count: "—", url: "/ats-checker" },
            { title: "Job Tracker", desc: "Track applications and interview status", count: "—", url: "#" },
          ].map((card) => (
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
