import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { appVersion } from "@/data/version";

export function Hero({ profileData = fallbackProfile }: { profileData?: PortfolioProfile }) {
  const profile = profileData;
  const avatarUrl = profile.media?.avatarUrl?.trim();
  const resumeUrl = profile.media?.resumeUrl?.trim();

  return (
    <section className="hero section" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> {profile.availability}</div>
          <p className="hello">Hello, I&apos;m {profile.name}.</p>
          <h1>{profile.role}</h1>
          <p className="hero-headline">{profile.headline}</p>
          <p className="hero-description">{profile.description}</p>
          <div className="hero-actions">
            <a href="/#about" className="button primary" data-track-event="cta_click" data-track-label="Hero Explore profile">Explore profile <span>↘</span></a>
            <a href="/contact" className="button secondary" data-track-event="contact_click" data-track-label="Hero Contact me">Contact me</a>
            {resumeUrl && (
              <a href={resumeUrl} className="button secondary" target="_blank" rel="noreferrer" data-track-event="resume_download" data-track-label="Hero Download CV">Download CV</a>
            )}
          </div>
          <div className="hero-meta">
            <span>{profile.location}</span>
            <span className="meta-line" />
            <span>Portfolio {appVersion.label}</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Professional profile card">
          <div className="profile-card">
            <div className="card-topline">
              <span>PROFILE / 001</span>
              <span>2026</span>
            </div>
            {avatarUrl ? (
              <div className="profile-photo-wrap">
                <img src={avatarUrl} alt={profile.media?.avatarAlt || `Portrait photo of ${profile.name}`} />
              </div>
            ) : (
              <div className="monogram">{profile.shortName}</div>
            )}
            <div className="card-content">
              <span className="card-kicker">Professional focus</span>
              <strong>{profile.headline}</strong>
              <div className="specialty-grid">
                {profile.specialties.map((item, index) => (
                  <div key={item}><span>0{index + 1}</span>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
