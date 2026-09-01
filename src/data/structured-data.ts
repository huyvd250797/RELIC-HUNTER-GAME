import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { absoluteUrl, siteConfig } from "@/data/seo";

type Project = PortfolioProfile["projects"][number];

export function personJsonLdFor(profile: PortfolioProfile = fallbackProfile) {
  const sameAs = [profile.social.linkedin, profile.social.github].filter((url) => url && url !== "#");

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    description: profile.description,
    email: `mailto:${profile.email}`,
    url: siteConfig.url,
    image: profile.media?.avatarUrl ? absoluteUrl(profile.media.avatarUrl) : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ho Chi Minh City",
      addressCountry: "VN",
    },
    knowsAbout: [
      ...profile.specialties,
      ...profile.skillGroups.flatMap((group) => group.skills),
    ],
    sameAs,
  };
}

export function websiteJsonLdFor(profile: PortfolioProfile = fallbackProfile) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    author: {
      "@type": "Person",
      name: profile.name,
    },
  };
}

export const personJsonLd = personJsonLdFor();
export const websiteJsonLd = websiteJsonLdFor();

export function projectJsonLd(project: Project, profile: PortfolioProfile = fallbackProfile) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    description: project.summary,
    url: absoluteUrl(`/projects/${project.slug}`),
    datePublished: project.year === "Current" ? undefined : project.year,
    keywords: project.technologies.join(", "),
    image: project.media?.thumbnailUrl ? absoluteUrl(project.media.thumbnailUrl) : undefined,
    associatedMedia: project.media?.assets?.filter((asset) => asset.url).map((asset) => ({
      "@type": asset.type === "Video" ? "VideoObject" : "MediaObject",
      name: asset.title,
      contentUrl: absoluteUrl(asset.url),
      description: asset.caption,
    })),
    author: {
      "@type": "Person",
      name: profile.name,
      jobTitle: profile.role,
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
