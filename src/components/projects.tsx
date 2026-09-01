"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { profile as fallbackProfile, type PortfolioProfile, type ProjectCategory } from "@/data/profile";

type Filter = "All" | ProjectCategory;
const filters: Filter[] = ["All", "Professional", "Product", "Tool"];

export function Projects({ profileData = fallbackProfile }: { profileData?: PortfolioProfile }) {
  const profile = profileData;
  const [active, setActive] = useState<Filter>("All");
  const visible = useMemo(
    () => profile.projects.filter((project) => active === "All" || project.category === active),
    [active, profile.projects],
  );

  return (
    <section className="section projects" id="projects">
      <div className="container">
        <div className="projects-heading">
          <div>
            <div className="section-label"><span>04</span> Selected work</div>
            <h2>Projects that connect business, product and delivery.</h2>
          </div>
          <p>
            A curated mix of professional implementation work and products built to solve practical operating problems.
          </p>
        </div>

        <div className="project-filters" role="group" aria-label="Filter projects">
          {filters.map((filter) => (
            <button
              type="button"
              className={active === filter ? "project-filter active" : "project-filter"}
              onClick={() => setActive(filter)}
              key={filter}
            >
              {filter}
            </button>
          ))}
        </div>
        <p className="project-result-count" aria-live="polite">Showing {visible.length} project{visible.length === 1 ? "" : "s"} · {active}</p>

        <div className="project-grid">
          {visible.map((project, index) => {
            const thumbnailUrl = project.media?.thumbnailUrl?.trim();
            const assetCount = project.media?.assets?.filter((asset) => asset.url?.trim()).length ?? 0;

            return (
              <article className={project.featured ? "project-card featured" : "project-card"} key={project.title}>
                <div className="project-card-top">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{project.year}</span>
                </div>

                <div className={thumbnailUrl ? "project-thumb has-image" : "project-thumb"} aria-hidden={!thumbnailUrl}>
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={project.media?.thumbnailAlt || `${project.title} project preview`} />
                  ) : (
                    <span>{project.media?.icon || project.title.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <div className="project-type-row">
                  <span className="project-category">{project.category}</span>
                  {project.featured && <span className="featured-badge">Featured</span>}
                  {assetCount > 0 && <span className="media-badge">{assetCount} asset{assetCount === 1 ? "" : "s"}</span>}
                </div>
                <h3>{project.title}</h3>
                <p className="project-role">{project.role}</p>
                <p className="project-summary">{project.summary}</p>
                <div className="project-contribution">
                  <span>Contribution</span>
                  <ul>
                    {project.contributions.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div className="project-tags">
                  {project.technologies.map((technology) => <span key={technology}>{technology}</span>)}
                </div>
                <Link className="project-case-link" href={`/projects/${project.slug}`} data-track-event="cta_click" data-track-label={`View case study: ${project.title}`}>View case study <span>↗</span></Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
