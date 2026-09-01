import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";

export function Credentials({ profileData = fallbackProfile }: { profileData?: PortfolioProfile }) {
  const profile = profileData;
  const hasEducation = profile.education.length > 0;
  const hasCertifications = profile.certifications.length > 0;
  if (!hasEducation && !hasCertifications) return null;

  return (
    <section className="section credentials" id="credentials">
      <div className="container">
        <div className="section-label"><span>05</span> Education & certifications</div>
        <div className="credentials-grid">
          {hasEducation && (
            <div>
              <h2>Education</h2>
              {profile.education.map((item) => (
                <article className="credential-item" key={`${item.period}-${item.institution}`}>
                  <span>{item.period}</span><h3>{item.degree}</h3><p>{item.institution}</p>{item.note && <small>{item.note}</small>}
                </article>
              ))}
            </div>
          )}
          {hasCertifications && (
            <div>
              <h2>Certifications</h2>
              {profile.certifications.map((item) => (
                <article className="credential-item" key={`${item.year}-${item.name}`}>
                  <span>{item.year}</span><h3>{item.name}</h3><p>{item.issuer}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
