import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ForgeButton from "@/components/ForgeButton";
import { toast } from "sonner";

const Auth = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-1 w-48 bg-secondary overflow-hidden">
          <div className="h-full bg-primary animate-pulse" style={{ width: "60%" }} />
        </div>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <a href="/" className="font-display text-lg font-bold uppercase tracking-tight">
            CV<span className="text-primary">Forge</span>
          </a>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="border border-border p-8">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-2">
              {isSignUp ? "Create Account" : "Access Terminal"}
            </p>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tighter mb-8">
              {isSignUp ? "Initialize Profile" : "Sign In"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-transparent border-b border-border focus:border-primary outline-none py-2 text-foreground font-mono transition-colors duration-75"
                    placeholder="Ahmed Hassan"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-border focus:border-primary outline-none py-2 text-foreground font-mono transition-colors duration-75"
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-transparent border-b border-border focus:border-primary outline-none py-2 text-foreground font-mono transition-colors duration-75"
                  placeholder="••••••••"
                />
              </div>

              <ForgeButton
                variant="primary"
                size="lg"
                className="w-full"
              >
                {submitting
                  ? "Processing..."
                  : isSignUp
                  ? "Initialize Account"
                  : "Authenticate"}
              </ForgeButton>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
              >
                {isSignUp
                  ? "Already have access? Sign in"
                  : "Need an account? Create one"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
