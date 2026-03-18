import { PortfolioData } from "@/types/portfolio";
import { Mail, ExternalLink, Github, Linkedin } from "lucide-react";

const DesignerTemplate = ({ data }: { data: PortfolioData }) => {
  const { hero, about, projects, skills, contact } = data;

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#1a1a1a", background: "#fff" }}>
      {/* Hero — large, bold, centered */}
      <div style={{ padding: "80px 48px", textAlign: "center", borderBottom: "1px solid #eee" }}>
        {hero.avatarUrl && (
          <img
            src={hero.avatarUrl}
            alt={hero.name}
            style={{ width: 96, height: 96, objectFit: "cover", borderRadius: "50%", margin: "0 auto 24px", border: "3px solid #1a1a1a" }}
          />
        )}
        <h1 style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 8 }}>
          {hero.name || "Your Name"}
        </h1>
        <p style={{ fontSize: 20, color: "#737373", fontWeight: 400, marginBottom: 12 }}>
          {hero.title || "Your Title"}
        </p>
        {hero.tagline && (
          <p style={{ fontSize: 15, color: "#999", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
            {hero.tagline}
          </p>
        )}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px" }}>
        {/* About */}
        {about && (
          <section style={{ marginBottom: 56, maxWidth: 600 }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: "#999", marginBottom: 16 }}>
              About
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "#404040" }}>{about}</p>
          </section>
        )}

        {/* Projects — gallery grid */}
        {projects.length > 0 && (
          <section style={{ marginBottom: 56 }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: "#999", marginBottom: 24 }}>
              Selected Work
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {projects.map((project) => (
                <div key={project.id} style={{ border: "1px solid #eee", overflow: "hidden" }}>
                  <div style={{ background: "#f5f5f5", height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {project.imageUrl ? (
                      <img src={project.imageUrl} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.2em" }}>Preview</span>
                    )}
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{project.title}</h3>
                      <div style={{ display: "flex", gap: 8 }}>
                        {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" style={{ color: "#999" }}><ExternalLink size={13} /></a>}
                        {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" style={{ color: "#999" }}><Github size={13} /></a>}
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>{project.description}</p>
                    {project.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {project.tags.map((tag) => (
                          <span key={tag} style={{ fontSize: 10, padding: "2px 8px", background: "#f5f5f5", color: "#737373" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section style={{ marginBottom: 56 }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: "#999", marginBottom: 16 }}>
              Expertise
            </h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {skills.map((skill) => (
                <span key={skill} style={{ fontSize: 13, padding: "6px 16px", background: "#1a1a1a", color: "#fff", fontWeight: 500 }}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        {(contact.email || contact.linkedin || contact.github) && (
          <section style={{ borderTop: "1px solid #eee", paddingTop: 32 }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: "#999", marginBottom: 16 }}>
              Get in Touch
            </h2>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {contact.email && (
                <a href={`mailto:${contact.email}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#404040", textDecoration: "none" }}>
                  <Mail size={14} /> {contact.email}
                </a>
              )}
              {contact.linkedin && (
                <a href={contact.linkedin.startsWith("http") ? contact.linkedin : `https://${contact.linkedin}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#404040", textDecoration: "none" }}>
                  <Linkedin size={14} /> LinkedIn
                </a>
              )}
              {contact.github && (
                <a href={contact.github.startsWith("http") ? contact.github : `https://${contact.github}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#404040", textDecoration: "none" }}>
                  <Github size={14} /> GitHub
                </a>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default DesignerTemplate;
