import { useAuth } from "@/contexts/AuthContext";
import ForgeButton from "@/components/ForgeButton";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="font-display text-lg font-bold uppercase tracking-tight">
            CV<span className="text-primary">Forge</span>
          </a>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground">
              {user?.email}
            </span>
            <ForgeButton variant="outline" onClick={handleSignOut}>
              Sign Out
            </ForgeButton>
          </div>
        </div>
      </nav>

      <div className="flex-1 container mx-auto px-4 py-16">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-4">
          Command Center
        </p>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tighter mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {[
            { title: "My CVs", desc: "Build and manage your ATS-optimized CVs", count: "0" },
            { title: "ATS Checker", desc: "Audit your CV against job descriptions", count: "—" },
            { title: "Job Tracker", desc: "Track applications and interview status", count: "—" },
          ].map((card) => (
            <div key={card.title} className="border border-border p-8 hover:bg-secondary transition-colors cursor-pointer">
              <span className="font-display text-3xl font-bold text-secondary">{card.count}</span>
              <h3 className="font-display text-lg font-bold uppercase tracking-tight mt-2 mb-1">
                {card.title}
              </h3>
              <p className="text-sm font-mono text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
