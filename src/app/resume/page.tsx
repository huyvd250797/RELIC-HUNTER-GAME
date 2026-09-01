import type { Metadata } from "next";
import Link from "next/link";
import { ResumePrintButton } from "@/components/resume-print-button";
import { profile } from "@/data/profile";
import { appVersion } from "@/data/version";
import { readPortfolioProfile } from "@/lib/portfolio-cms";

export const metadata: Metadata = {
  title: `Resume | ${profile.name}`,
  description: `ATS-friendly professional resume for ${profile.name}, ${profile.role}.`,
  alternates: { canonical: "/resume" },
  openGraph: {
    title: `Resume | ${profile.name}`,
    description: `ATS-friendly professional resume for ${profile.name}, ${profile.role}.`,
    url: "/resume",
  },
};

export default async function ResumePage() {
  const { profile } = await readPortfolioProfile();
  const resumeUrl = profile.media?.resumeUrl?.trim();

  return (
    <main id="top" className="resume-page">
      <div className="resume-toolbar container">
        <Link href="/">← Back to portfolio</Link>
        <div className="resume-toolbar-actions">
          <span>{appVersion.label} · {appVersion.name}</span>
          {resumeUrl && <a className="resume-download-link" href={resumeUrl} target="_blank" rel="noreferrer" data-track-event="resume_download" data-track-label="Resume Download attached CV">Download CV file</a>}
          <ResumePrintButton />
        </div>
      </div>

      <article className="resume-sheet" aria-label={`${profile.name} resume`}>
        <header className="resume-header">
          <div>
            <p className="resume-kicker">Professional Resume</p>
            <h1>{profile.name}</h1>
            <h2>{profile.role}</h2>
          </div>
          <div className="resume-contact">
            <a href={`mailto:${profile.email}`} data-track-event="contact_click" data-track-label="Resume email">{profile.email}</a>
            <span>{profile.location}</span>
            <span>{profile.availability}</span>
          </div>
        </header>

        <section className="resume-section resume-summary">
          <h3>Professional Summary</h3>
          <div>
            <p>{profile.careerSummary.text}</p>
            <div className="resume-specialties">
              {profile.specialties.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
        </section>

        <section className="resume-section">
          <h3>Experience</h3>
          <div className="resume-stack">
            {profile.experience.map((item) => (
              <article className="resume-entry" key={`${item.role}-${item.period}`}>
                <div className="resume-entry-head">
                  <div>
                    <h4>{item.role}</h4>
                    <p>{item.organization}</p>
                  </div>
                  <span>{item.period}</span>
                </div>
                <p className="resume-entry-summary">{item.summary}</p>
                <ul>
                  {item.responsibilities.map((responsibility) => <li key={responsibility}>{responsibility}</li>)}
                </ul>
                <div className="resume-tags">
                  {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="resume-section">
          <h3>Selected Projects</h3>
          <div className="resume-project-list">
            {profile.projects.filter((project) => project.featured).map((project) => (
              <article className="resume-project" key={project.slug}>
                <div className="resume-entry-head">
                  <div>
                    <h4>{project.title}</h4>
                    <p>{project.role}</p>
                  </div>
                  <span>{project.year}</span>
                </div>
                <p>{project.summary}</p>
                <ul>
                  {project.contributions.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <div className="resume-tags">
                  {project.technologies.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="resume-section">
          <h3>Skills</h3>
          <div className="resume-skill-grid">
            {profile.skillGroups.map((group) => (
              <article key={group.title}>
                <h4>{group.title}</h4>
                <p>{group.skills.join(" · ")}</p>
              </article>
            ))}
          </div>
        </section>

        {profile.education.length > 0 && (
          <section className="resume-section">
            <h3>Education</h3>
            <div className="resume-stack">
              {profile.education.map((item) => (
                <article className="resume-entry compact" key={`${item.institution}-${item.degree}`}>
                  <div className="resume-entry-head">
                    <div><h4>{item.degree}</h4><p>{item.institution}</p></div>
                    <span>{item.period}</span>
                  </div>
                  {item.note && <p>{item.note}</p>}
                </article>
              ))}
            </div>
          </section>
        )}

        {profile.certifications.length > 0 && (
          <section className="resume-section">
            <h3>Certifications</h3>
            <div className="resume-stack">
              {profile.certifications.map((item) => (
                <article className="resume-entry compact" key={`${item.name}-${item.year}`}>
                  <div className="resume-entry-head">
                    <div><h4>{item.name}</h4><p>{item.issuer}</p></div>
                    <span>{item.year}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <footer className="resume-foot">
          <span>{profile.name} · {profile.role}</span>
          <span>{appVersion.label}</span>
        </footer>
      </article>
    </main>
  );
}
