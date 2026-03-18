import { PortfolioData } from "@/types/portfolio";
import { Mail, ExternalLink, Github, Linkedin } from "lucide-react";

const MinimalPortfolioTemplate = ({ data }: { data: PortfolioData }) => {
  const { hero, about, projects, skills, contact } = data;

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#1a1a1a", background: "#fff", padding: "48px", maxWidth: 700, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>
          {hero.name || "Your Name"}
        </h1>
        <p style={{ fontSize: 14, color: "#737373", marginBottom: 8 }}>{hero.title || "Your Title"}</p>
        {hero.tagline && <p style={{ fontSize: 13, color: "#999", lineHeight: 1.6 }}>{hero.tagline}</p>}
      </div>

      {/* About */}
      {about && (
        <section style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: "#404040" }}>{about}</p>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#999", marginBottom: 20, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
            Projects
          </h2>
          {projects.map((project, i) => (
            <div key={project.id} style={{ marginBottom: 20, paddingBottom: i < projects.length - 1 ? 20 : 0, borderBottom: i < projects.length - 1 ? "1px solid #f5f5f5" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>{project.title}</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" style={{ color: "#bbb" }}><ExternalLink size={12} /></a>}
                  {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" style={{ color: "#bbb" }}><Github size={12} /></a>}
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{project.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#999", marginBottom: 12, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
            Skills
          </h2>
          <p style={{ fontSize: 12, color: "#404040", lineHeight: 1.8 }}>{skills.join(" · ")}</p>
        </section>
      )}

      {/* Contact */}
      {(contact.email || contact.linkedin || contact.github) && (
        <section>
          <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#999", marginBottom: 12, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
            Contact
          </h2>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {contact.email && (
              <a href={`mailto:${contact.email}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#525252", textDecoration: "none" }}>
                <Mail size={12} /> {contact.email}
              </a>
            )}
            {contact.linkedin && (
              <a href={contact.linkedin.startsWith("http") ? contact.linkedin : `https://${contact.linkedin}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#525252", textDecoration: "none" }}>
                <Linkedin size={12} /> LinkedIn
              </a>
            )}
            {contact.github && (
              <a href={contact.github.startsWith("http") ? contact.github : `https://${contact.github}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#525252", textDecoration: "none" }}>
                <Github size={12} /> GitHub
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default MinimalPortfolioTemplate;
