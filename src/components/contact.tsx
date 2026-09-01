import { ContactForm } from "@/components/contact-form";
import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";

export function Contact({ profileData = fallbackProfile }: { profileData?: PortfolioProfile }) {
  const profile = profileData;
  const contactMethods = profile.contact.methods.map((method) =>
    method.label === "Email" ? { ...method, value: profile.email, href: `mailto:${profile.email}` } : method
  );

  return (
    <section className="section contact contact-v060" id="contact">
      <div className="container contact-shell">
        <div className="contact-content">
          <div className="section-label light"><span>07</span> Contact</div>
          <p className="contact-kicker">{profile.contact.subtitle}</p>
          <h2>{profile.contact.title}</h2>
          <p className="contact-description">{profile.contact.description}</p>

          <div className="contact-methods" aria-label="Contact methods">
            {contactMethods.map((method) => (
              <a className="contact-method" href={method.href} key={method.label} data-track-event="contact_click" data-track-label={`Contact method: ${method.label}`}>
                <span>{method.label}</span>
                <strong>{method.value}</strong>
                <p>{method.description}</p>
              </a>
            ))}
          </div>

          <div className="contact-note">
            <span>Profile status</span>
            <p>{profile.availability}</p>
          </div>
        </div>

        <aside className="contact-panel" aria-label="Send a message">
          <div className="contact-panel-head">
            <span>Quick message</span>
            <p>{profile.contact.responseNote}</p>
          </div>
          <ContactForm profileData={profile} />
        </aside>
      </div>
    </section>
  );
}
