import { profile } from "@/data/profile";

const fallbackSiteUrl = "https://huyvo-portfolio.vercel.app";
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl;

export const siteUrl = rawSiteUrl.replace(/\/$/, "");

export const siteConfig = {
  name: `${profile.name} Portfolio`,
  title: `${profile.name} | ${profile.role}`,
  description:
    "Professional portfolio and ATS-friendly resume for Huy Vo, a Project Manager and Functional Consultant focused on business analysis, software implementation, data validation and delivery for education technology.",
  url: siteUrl,
  locale: "en_US",
  keywords: [
    profile.name,
    profile.role,
    "Project Manager",
    "Functional Consultant",
    "Business Analysis",
    "Software Implementation",
    "Education Technology",
    "SQL Server",
    "UAT",
    "Portfolio",
    "Resume",
  ],
} as const;

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath}`;
}
