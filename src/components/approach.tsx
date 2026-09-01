import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";

export function Approach({ profileData = fallbackProfile }: { profileData?: PortfolioProfile }) {
  const profile = profileData;

  return (
    <section className="section approach" id="approach">
      <div className="container">
        <div className="section-label"><span>06</span> Working process</div>
        <div className="approach-heading">
          <h2>From requirement to result.</h2>
          <p>A practical six-step process for keeping complex implementation work clear, aligned and deliverable.</p>
        </div>
        <div className="approach-grid process-grid">
          {profile.workingProcess.map((item) => (
            <article className="approach-card" key={item.index}>
              <span className="card-index">{item.index}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
              <span className="corner-arrow">↘</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
