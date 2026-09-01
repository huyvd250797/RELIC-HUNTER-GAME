import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/data/seo";
import { breadcrumbJsonLd, projectJsonLd } from "@/data/structured-data";
import { readPortfolioProfile } from "@/lib/portfolio-cms";

export const dynamicParams = true;

export async function generateStaticParams() {
  const { profile } = await readPortfolioProfile();
  return profile.projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { profile } = await readPortfolioProfile();
  const project = profile.projects.find((item) => item.slug === slug);
  const previewImage = project?.media?.thumbnailUrl?.trim() || "/opengraph-image";

  return project
    ? {
        title: `${project.title} Case Study`,
        description: project.summary,
        alternates: { canonical: `/projects/${project.slug}` },
        openGraph: {
          title: `${project.title} Case Study | ${profile.name}`,
          description: project.summary,
          url: `/projects/${project.slug}`,
          type: "article",
          images: [absoluteUrl(previewImage)],
        },
        twitter: {
          card: "summary_large_image",
          title: `${project.title} Case Study | ${profile.name}`,
          description: project.summary,
          images: [absoluteUrl(previewImage)],
        },
      }
    : {};
}

export default async function ProjectCaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { profile } = await readPortfolioProfile();
  const project = profile.projects.find((item) => item.slug === slug);
  if (!project) {
    notFound();
  }

  const projectData = project as NonNullable<typeof project>;
  const study = projectData.caseStudy;
  const projectAssets = projectData.media?.assets?.filter((asset) => asset.url?.trim()) ?? [];
  const thumbnailUrl = projectData.media?.thumbnailUrl?.trim();
  const hasMedia = Boolean(thumbnailUrl || projectAssets.length);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Projects", url: absoluteUrl("/#projects") },
    { name: projectData.title, url: absoluteUrl(`/projects/${projectData.slug}`) },
  ]);

  return (
    <main id="top" className="case-study-page">
      <JsonLd data={[projectJsonLd(projectData, profile), breadcrumb]} />
      <div className="case-nav container">
        <Link href="/#projects" className="case-back" data-track-event="cta_click" data-track-label="Case study back to projects">← Back to projects</Link>
        <span>{profile.shortName}<i>.</i></span>
      </div>

      <header className={thumbnailUrl ? "case-hero has-preview" : "case-hero"}>
        <div className="container case-hero-grid">
          <div>
            <div className="case-eyebrow">
              <span>{projectData.category}</span><span>{projectData.year}</span><span>Case Study</span>
            </div>
            <h1>{projectData.title}</h1>
            <p className="case-role">{projectData.role}</p>
            <p className="case-lead">{projectData.summary}</p>
            <div className="project-tags case-tags">
              {projectData.technologies.map((technology) => <span key={technology}>{technology}</span>)}
            </div>
          </div>
          {thumbnailUrl && (
            <figure className="case-preview-card">
              <img src={thumbnailUrl} alt={projectData.media?.thumbnailAlt || `${projectData.title} preview`} />
              <figcaption>{projectData.media?.thumbnailAlt || "Project preview"}</figcaption>
            </figure>
          )}
        </div>
      </header>

      {hasMedia && (
        <section className="case-section case-media-section">
          <div className="container">
            <p className="section-kicker">Media — Project assets</p>
            <div className="case-media-heading">
              <h2>Visual evidence for the project story.</h2>
              <p>Add sanitized screenshots, diagrams, workflow images or public documents from the Admin Media tab.</p>
            </div>
            <div className="case-media-grid">
              {projectAssets.map((asset) => (
                <a key={`${asset.title}-${asset.url}`} className="case-media-card" href={asset.url} target="_blank" rel="noreferrer" data-track-event="cta_click" data-track-label={`Project media: ${projectData.title} - ${asset.title}`}>
                  <div className="case-media-image">
                    {asset.type === "Image" || asset.type === "Screenshot" || asset.type === "Diagram" ? (
                      <img src={asset.url} alt={asset.alt || asset.title} />
                    ) : (
                      <span>{asset.type}</span>
                    )}
                  </div>
                  <div>
                    <span>{asset.type}</span>
                    <h3>{asset.title}</h3>
                    {asset.caption && <p>{asset.caption}</p>}
                  </div>
                </a>
              ))}
              {projectAssets.length === 0 && thumbnailUrl && (
                <article className="case-media-card static-card">
                  <div className="case-media-image"><img src={thumbnailUrl} alt={projectData.media?.thumbnailAlt || `${projectData.title} preview`} /></div>
                  <div><span>Preview</span><h3>Project thumbnail</h3><p>{projectData.media?.thumbnailAlt || "Primary project visual."}</p></div>
                </article>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="case-section">
        <div className="container case-two-col">
          <div><p className="section-kicker">01 — Context</p><h2>Where the work started.</h2></div>
          <p className="case-copy">{study.context}</p>
        </div>
      </section>

      <section className="case-section case-alt">
        <div className="container case-two-col">
          <div><p className="section-kicker">02 — Problem</p><h2>What needed to be solved.</h2></div>
          <p className="case-copy">{study.problem}</p>
        </div>
      </section>

      <section className="case-section">
        <div className="container">
          <p className="section-kicker">03 — My contribution</p>
          <div className="case-contribution-grid">
            {projectData.contributions.map((item, index) => (
              <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item}</h3></article>
            ))}
          </div>
        </div>
      </section>

      <section className="case-section case-dark">
        <div className="container">
          <p className="section-kicker">04 — Process</p>
          <h2>A structured path from need to delivery.</h2>
          <div className="case-process-grid">
            {study.process.map((item, index) => (
              <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="case-section">
        <div className="container case-two-col">
          <div><p className="section-kicker">05 — Solution</p><h2>How the solution took shape.</h2></div>
          <p className="case-copy">{study.solution}</p>
        </div>
      </section>

      <section className="case-section case-alt">
        <div className="container case-two-col">
          <div><p className="section-kicker">06 — Result</p><h2>What improved.</h2></div>
          <p className="case-copy">{study.result}</p>
        </div>
      </section>

      <section className="case-section">
        <div className="container">
          <p className="section-kicker">07 — Lessons learned</p>
          <div className="case-lessons">
            {study.lessons.map((lesson, index) => <div key={lesson}><span>{String(index + 1).padStart(2, "0")}</span><p>{lesson}</p></div>)}
          </div>
          <div className="case-next"><Link href="/#projects" data-track-event="cta_click" data-track-label="Case study explore other projects">Explore other projects ↗</Link></div>
        </div>
      </section>
      <Footer profileData={profile} />
    </main>
  );
}
