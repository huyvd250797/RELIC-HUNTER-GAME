import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";

export function CareerSummary({ profileData = fallbackProfile }: { profileData?: PortfolioProfile }) {
  const profile = profileData;

  return (
    <section className="section career-summary" id="summary">
      <div className="container">
        <div className="section-label"><span>02</span> Career summary</div>
        <div className="summary-layout">
          <div>
            <p className="section-kicker">{profile.careerSummary.title}</p>
            <h2>Business context.<br />Structured execution.</h2>
          </div>
          <div className="summary-content">
            <p className="summary-intro">{profile.careerSummary.text}</p>
            <div className="snapshot-grid">
              {profile.careerSummary.highlights.map((item) => (
                <div className="snapshot-card" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
