import { PortfolioData } from "@/types/portfolio";
import { Mail, ExternalLink, Github, Linkedin } from "lucide-react";

const DeveloperTemplate = ({ data }: { data: PortfolioData }) => {
  const { hero, about, projects, skills, contact } = data;

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0a0a0a", background: "#fafafa" }}>
      {/* Hero */}
      <div style={{ background: "#0a0a0a", color: "#fafafa", padding: "64px 48px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {hero.avatarUrl && (
            <img
              src={hero.avatarUrl}
              alt={hero.name}
              style={{ width: 72, height: 72, objectFit: "cover", marginBottom: 24, border: "2px solid #b3f53a" }}
            />
          )}
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
            {hero.name || "Your Name"}
          </h1>
          <p style={{ fontSize: 18, color: "#b3f53a", fontWeight: 600, marginBottom: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
            {hero.title || "Your Title"}
          </p>
          {hero.tagline && (
            <p style={{ fontSize: 14, color: "#a1a1a1", lineHeight: 1.6, fontFamily: "'IBM Plex Mono', monospace" }}>
              {hero.tagline}
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px" }}>
        {/* About */}
        {about && (
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#b3f53a", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>
              About
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#404040", fontFamily: "'IBM Plex Mono', monospace" }}>
              {about}
            </p>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#b3f53a", marginBottom: 24, fontFamily: "'IBM Plex Mono', monospace" }}>
              Projects
            </h2>
            <div style={{ display: "grid", gap: 16 }}>
              {projects.map((project) => (
                <div key={project.id} style={{ border: "1px solid #e5e5e5", padding: 24, background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{project.title}</h3>
                    <div style={{ display: "flex", gap: 8 }}>
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noreferrer" style={{ color: "#737373" }}>
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {project.repoUrl && (
                        <a href={project.repoUrl} target="_blank" rel="noreferrer" style={{ color: "#737373" }}>
                          <Github size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "#525252", lineHeight: 1.6, marginBottom: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {project.description}
                  </p>
                  {project.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {project.tags.map((tag) => (
                        <span key={tag} style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", padding: "2px 8px", border: "1px solid #e5e5e5", color: "#737373", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#b3f53a", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>
              Skills
            </h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {skills.map((skill) => (
                <span key={skill} style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", padding: "4px 12px", border: "1px solid #0a0a0a", color: "#0a0a0a", fontWeight: 500 }}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        {(contact.email || contact.linkedin || contact.github) && (
          <section style={{ borderTop: "1px solid #e5e5e5", paddingTop: 32 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#b3f53a", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>
              Contact
            </h2>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {contact.email && (
                <a href={`mailto:${contact.email}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#525252", fontFamily: "'IBM Plex Mono', monospace", textDecoration: "none" }}>
                  <Mail size={14} /> {contact.email}
                </a>
              )}
              {contact.linkedin && (
                <a href={contact.linkedin.startsWith("http") ? contact.linkedin : `https://${contact.linkedin}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#525252", fontFamily: "'IBM Plex Mono', monospace", textDecoration: "none" }}>
                  <Linkedin size={14} /> LinkedIn
                </a>
              )}
              {contact.github && (
                <a href={contact.github.startsWith("http") ? contact.github : `https://${contact.github}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#525252", fontFamily: "'IBM Plex Mono', monospace", textDecoration: "none" }}>
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

export default DeveloperTemplate;
