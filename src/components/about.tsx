import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";

export function About({ profileData = fallbackProfile }: { profileData?: PortfolioProfile }) {
  const profile = profileData;

  return (
    <section className="section about" id="about">
      <div className="container">
        <div className="section-label"><span>01</span> About</div>
        <div className="about-grid">
          <h2>Connecting business context with software execution.</h2>
          <div className="about-copy">
            {profile.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <div className="skill-row">
              {profile.specialties.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
