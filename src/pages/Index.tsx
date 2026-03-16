import { motion } from "framer-motion";
import LiveCVPreview from "@/components/LiveCVPreview";
import ATSScoreGauge from "@/components/ATSScoreGauge";
import ForgeButton from "@/components/ForgeButton";
import { Shield, Zap, Target, Check, ArrowRight } from "lucide-react";

const entrance = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] },
};

const Hero = () => (
  <section className="relative border-b border-border">
    <div className="container mx-auto px-4 py-24 lg:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <motion.div {...entrance} className="space-y-8">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">
            ATS-Optimized CV Builder
          </p>
          <h1 className="font-display text-5xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
            Your CV Gets
            <br />
            Rejected Before
            <br />
            Anyone{" "}
            <span className="text-primary">Reads It.</span>
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground max-w-md font-mono">
            87% of CVs in Egypt are filtered out by ATS software before a human
            ever sees them. CVForge reverse-engineers the algorithm.
          </p>
          <div className="flex gap-4 pt-4">
            <ForgeButton size="lg">Check Your ATS Score — Free</ForgeButton>
            <ForgeButton variant="outline" size="lg">
              Start Building
            </ForgeButton>
          </div>
          <div className="flex items-center gap-8 pt-4 text-xs font-mono text-muted-foreground">
            <span>Wuzzuf Ready</span>
            <span className="text-border">|</span>
            <span>Bayt Compatible</span>
            <span className="text-border">|</span>
            <span>LinkedIn Optimized</span>
          </div>
        </motion.div>

        <motion.div
          {...entrance}
          className="relative lg:pl-8"
        >
          <div className="border border-border p-1 bg-secondary">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
              <div className="w-2 h-2 bg-primary" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Live Preview — ATS Match: 94.2%
              </span>
            </div>
            <LiveCVPreview />
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const features = [
  {
    icon: Shield,
    title: "ATS Score Checker",
    desc: "Simulate how Wuzzuf, Bayt, and LinkedIn parsers read your CV. Get a match score and fix dead zones instantly.",
    stat: "94.2% AVG SCORE",
  },
  {
    icon: Zap,
    title: "AI Bullet Rewriter",
    desc: '"I managed a team" becomes "Orchestrated cross-functional squad of 12 delivering $2.4M billing platform." One click.',
    stat: "3X MORE IMPACT",
  },
  {
    icon: Target,
    title: "JD Tailoring Engine",
    desc: "Paste any job description. CVForge injects missing keywords and restructures your CV to match the role's priority matrix.",
    stat: "12ms PARSE TIME",
  },
];

const Features = () => (
  <section className="border-b border-border">
    <div className="container mx-auto px-4 py-24">
      <motion.div {...entrance} className="mb-16">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-4">
          Core Systems
        </p>
        <h2 className="font-display text-4xl lg:text-5xl font-bold tracking-tighter uppercase">
          Stop Being Invisible
          <br />
          To Algorithms.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            {...entrance}
            transition={{ ...entrance.transition, delay: i * 0.05 }}
            className="border border-border p-8 hover:bg-secondary transition-colors duration-150 group"
          >
            <f.icon className="w-5 h-5 text-primary mb-6" strokeWidth={1.5} />
            <p className="text-[10px] font-mono uppercase tracking-widest text-primary mb-3">
              {f.stat}
            </p>
            <h3 className="font-display text-xl font-bold uppercase tracking-tight mb-3">
              {f.title}
            </h3>
            <p className="text-sm text-muted-foreground font-mono leading-relaxed">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section className="border-b border-border">
    <div className="container mx-auto px-4 py-24">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-4">
        Process
      </p>
      <h2 className="font-display text-4xl font-bold tracking-tighter uppercase mb-16">
        Three Steps. Zero Guesswork.
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {[
          { step: "01", title: "Paste or Build", desc: "Paste your existing CV or start from our ATS-compliant template. Single-column. Parser-first." },
          { step: "02", title: "Audit & Optimize", desc: "Our parser simulation identifies dead zones—missing keywords, weak verbs, formatting traps that kill ATS scores." },
          { step: "03", title: "Deploy", desc: "Export as PDF or DOCX. Tailored for Wuzzuf, Bayt, LinkedIn, or any multinational portal in Egypt." },
        ].map((item, i) => (
          <div key={item.step} className="border border-border p-8 relative">
            <span className="font-display text-6xl font-bold text-secondary">
              {item.step}
            </span>
            <h3 className="font-display text-lg font-bold uppercase tracking-tight mt-4 mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground font-mono leading-relaxed">
              {item.desc}
            </p>
            {i < 2 && (
              <ArrowRight className="hidden md:block absolute right-[-13px] top-1/2 -translate-y-1/2 w-6 h-6 text-primary z-10" />
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

const plans = [
  {
    name: "Free",
    price: "0",
    desc: "Test your current CV",
    features: ["1 ATS score check", "Basic formatting audit", "Single CV template"],
    cta: "Initialize Free Audit",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "199",
    desc: "For active job seekers",
    features: [
      "Unlimited ATS checks",
      "AI bullet rewriter",
      "JD tailoring engine",
      "PDF + DOCX export",
      "5 CV templates",
    ],
    cta: "Deploy Pro",
    highlighted: true,
  },
  {
    name: "Career",
    price: "399",
    desc: "Full career arsenal",
    features: [
      "Everything in Pro",
      "Job tracker dashboard",
      "LinkedIn optimization",
      "Cover letter generator",
      "Priority support",
    ],
    cta: "Go Career",
    highlighted: false,
  },
];

const Pricing = () => (
  <section className="border-b border-border">
    <div className="container mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-4">
          Pricing
        </p>
        <h2 className="font-display text-4xl lg:text-5xl font-bold tracking-tighter uppercase">
          Invest in Visibility.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`border border-border p-8 flex flex-col ${
              plan.highlighted ? "bg-secondary border-primary" : ""
            }`}
          >
            {plan.highlighted && (
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary mb-4">
                Most Popular
              </span>
            )}
            <h3 className="font-display text-2xl font-bold uppercase">
              {plan.name}
            </h3>
            <div className="mt-4 mb-2">
              <span className="font-display text-4xl font-bold">
                {plan.price}
              </span>
              <span className="text-sm text-muted-foreground font-mono ml-1">
                EGP/mo
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-mono mb-6">
              {plan.desc}
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm font-mono text-foreground"
                >
                  <Check className="w-3 h-3 text-primary flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <ForgeButton
              variant={plan.highlighted ? "primary" : "outline"}
              className="w-full justify-center"
            >
              {plan.cta}
            </ForgeButton>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const testimonials = [
  {
    name: "Sara Mahmoud",
    role: "Product Manager · P&G Egypt",
    text: "I was getting zero callbacks on Wuzzuf. After CVForge, I got 4 interviews in one week. The ATS score jumped from 34% to 91%.",
  },
  {
    name: "Omar Khaled",
    role: "Software Engineer · Instabug",
    text: "The JD tailoring is insane. I paste the job description, and my CV rewrites itself to match. Got hired in 3 weeks.",
  },
  {
    name: "Nour ElDin",
    role: "Data Analyst · Vodafone",
    text: "Finally a tool that understands the Egyptian job market. Wuzzuf compatibility alone is worth the subscription.",
  },
];

const Testimonials = () => (
  <section className="border-b border-border">
    <div className="container mx-auto px-4 py-24">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-4">
        Field Reports
      </p>
      <h2 className="font-display text-4xl font-bold tracking-tighter uppercase mb-16">
        Deployed & Verified.
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {testimonials.map((t) => (
          <div key={t.name} className="border border-border p-8">
            <p className="text-sm font-mono leading-relaxed text-muted-foreground mb-6">
              "{t.text}"
            </p>
            <div>
              <p className="font-display font-bold text-sm">{t.name}</p>
              <p className="text-xs font-mono text-muted-foreground">
                {t.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-border">
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <h3 className="font-display text-xl font-bold uppercase tracking-tight">
            CV<span className="text-primary">Forge</span>
          </h3>
          <p className="text-sm font-mono text-muted-foreground mt-3 max-w-sm">
            ATS-optimized CV engineering for the Egyptian job market. Built for
            Wuzzuf, Bayt, LinkedIn, and multinational portals.
          </p>
        </div>
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-primary mb-4">
            Product
          </p>
          <ul className="space-y-2 text-sm font-mono text-muted-foreground">
            <li className="hover:text-foreground transition-colors cursor-pointer">ATS Checker</li>
            <li className="hover:text-foreground transition-colors cursor-pointer">CV Builder</li>
            <li className="hover:text-foreground transition-colors cursor-pointer">JD Tailoring</li>
            <li className="hover:text-foreground transition-colors cursor-pointer">Pricing</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-primary mb-4">
            Company
          </p>
          <ul className="space-y-2 text-sm font-mono text-muted-foreground">
            <li className="hover:text-foreground transition-colors cursor-pointer">About</li>
            <li className="hover:text-foreground transition-colors cursor-pointer">Blog</li>
            <li className="hover:text-foreground transition-colors cursor-pointer">Privacy</li>
            <li className="hover:text-foreground transition-colors cursor-pointer">Terms</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs font-mono text-muted-foreground">
          © 2026 CVForge. All rights reserved.
        </p>
        <p className="text-xs font-mono text-muted-foreground">
          Made in Cairo 🇪🇬
        </p>
      </div>
    </div>
  </footer>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border sticky top-0 bg-background z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">
            CV<span className="text-primary">Forge</span>
          </h2>
          <div className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span className="hover:text-foreground transition-colors cursor-pointer">Features</span>
            <span className="hover:text-foreground transition-colors cursor-pointer">Pricing</span>
            <span className="hover:text-foreground transition-colors cursor-pointer">ATS Checker</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer hidden md:block">
              Sign In
            </span>
            <ForgeButton>Get Started</ForgeButton>
          </div>
        </div>
      </nav>

      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
