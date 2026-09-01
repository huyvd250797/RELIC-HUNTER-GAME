import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function NotFound() {
  return (
    <main id="top">
      <Header />
      <section className="section not-found-section">
        <div className="container not-found-card">
          <p className="section-kicker">404 — Not found</p>
          <h1>Page not found.</h1>
          <p>The page you opened does not exist or may have been moved during a portfolio version upgrade.</p>
          <Link href="/" className="button primary">Back to portfolio <span>↗</span></Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
