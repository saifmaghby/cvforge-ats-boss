import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 max-w-2xl">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-2">
          Configuration
        </p>
        <h1 className="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tighter mb-8">
          Settings
        </h1>

        <div className="border border-border p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              Email
            </label>
            <p className="font-mono text-sm text-foreground">{user?.email}</p>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              Account ID
            </label>
            <p className="font-mono text-xs text-muted-foreground">{user?.id}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
