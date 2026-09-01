import { About } from "@/components/about";
import { Approach } from "@/components/approach";
import { CareerSummary } from "@/components/career-summary";
import { Contact } from "@/components/contact";
import { Credentials } from "@/components/credentials";
import { Experience } from "@/components/experience";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { Hero } from "@/components/hero";
import { Skills } from "@/components/skills";
import { Projects } from "@/components/projects";
import { ProductionReadiness } from "@/components/production-readiness";
import { personJsonLdFor, websiteJsonLdFor } from "@/data/structured-data";
import { readPortfolioProfile } from "@/lib/portfolio-cms";

export default async function Home() {
  const { profile } = await readPortfolioProfile();

  return (
    <main>
      <JsonLd data={[personJsonLdFor(profile), websiteJsonLdFor(profile)]} />
      <Header profileData={profile} />
      <Hero profileData={profile} />
      <About profileData={profile} />
      <CareerSummary profileData={profile} />
      <Experience profileData={profile} />
      <Projects profileData={profile} />
      <Skills profileData={profile} />
      <Credentials profileData={profile} />
      <Approach profileData={profile} />
      <ProductionReadiness profileData={profile} />
      <Contact profileData={profile} />
      <Footer profileData={profile} />
    </main>
  );
}
