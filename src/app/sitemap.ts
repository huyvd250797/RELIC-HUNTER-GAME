import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/data/seo";
import { readPortfolioProfile } from "@/lib/portfolio-cms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { profile } = await readPortfolioProfile();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/resume"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = profile.projects.map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: project.featured ? 0.8 : 0.65,
  }));

  return [...staticRoutes, ...projectRoutes];
}
