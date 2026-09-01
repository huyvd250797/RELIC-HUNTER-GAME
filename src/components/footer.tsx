import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { appVersion } from "@/data/version";

export function Footer({ profileData = fallbackProfile }: { profileData?: PortfolioProfile }) {
  const profile = profileData;

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© 2026 {profile.name}. All rights reserved.</span>
        <span>Designed for clarity. Built for the web.</span>
        <span>{appVersion.label}</span>
      </div>
    </footer>
  );
}
