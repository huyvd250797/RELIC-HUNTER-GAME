import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { appVersion } from "@/data/version";

type ProductionReadinessProps = {
  profileData?: PortfolioProfile;
};

const productionItems = [
  {
    label: "Live CMS",
    title: "Supabase-backed profile",
    text: "Admin changes can be saved live while every public page keeps a safe source fallback.",
  },
  {
    label: "Resume",
    title: "ATS-friendly CV",
    text: "The resume page is print-ready and reuses the same portfolio data source.",
  },
  {
    label: "Case studies",
    title: "Project detail pages",
    text: "Each selected project has a structured case-study page for deeper professional context.",
  },
  {
    label: "SEO",
    title: "Search and sharing ready",
    text: "Metadata, sitemap, robots, manifest, OpenGraph and JSON-LD are included for production publishing.",
  },
];

export function ProductionReadiness({ profileData = fallbackProfile }: ProductionReadinessProps) {
  const profile = profileData;

  return (
    <section className="section production-readiness" id="production">
      <div className="container">
        <div className="production-heading">
          <div>
            <div className="section-label"><span>08</span> Production release</div>
            <h2>{appVersion.label} is ready for public portfolio use.</h2>
          </div>
          <p>
            Final production layer for {profile.name}: live CMS, structured content, responsive pages,
            SEO assets and deployment documentation are consolidated into one Vercel-ready release.
          </p>
        </div>
        <div className="production-grid">
          {productionItems.map((item, index) => (
            <article key={item.title} className="production-card">
              <span>{String(index + 1).padStart(2, "0")} · {item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
