import type { Metadata } from "next";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { profile } from "@/data/profile";
import { readPortfolioProfile } from "@/lib/portfolio-cms";

export const metadata: Metadata = {
  title: `Contact | ${profile.name}`,
  description: `Contact ${profile.name} for project management, functional consulting and software implementation opportunities.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact | ${profile.name}`,
    description: `Contact ${profile.name} for project management, functional consulting and software implementation opportunities.`,
    url: "/contact",
  },
};

export default async function ContactPage() {
  const { profile: portfolio } = await readPortfolioProfile();

  return (
    <main id="top">
      <Header profileData={portfolio} />
      <div className="contact-page-spacer" />
      <Contact profileData={portfolio} />
      <Footer profileData={portfolio} />
    </main>
  );
}
