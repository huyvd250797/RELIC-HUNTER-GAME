"use client";

import { useEffect, useState } from "react";

const sectionIds = ["top", "about", "experience", "projects", "skills", "approach", "contact"];
const revealSelector = [
  ".section .container",
  ".hero-copy",
  ".hero-visual",
  ".snapshot-card",
  ".timeline-item",
  ".project-card",
  ".skill-group",
  ".credential-item",
  ".approach-card",
  ".contact-method",
  ".contact-panel",
  ".case-hero .container",
  ".case-section .container",
  ".resume-sheet",
  ".resume-section",
].join(", ");

export function ScrollUx() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealElements = Array.from(
      new Set(document.querySelectorAll<HTMLElement>(revealSelector)),
    );

    root.classList.add("ux-ready");

    const updateScrollProgress = () => {
      const scrollableHeight = root.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
      root.style.setProperty("--scroll-progress", progress.toFixed(4));
      setShowBackToTop(window.scrollY > 520);
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });

    if (prefersReducedMotion) {
      revealElements.forEach((element) => element.classList.add("is-inview"));
      root.dataset.activeSection = "top";
      return () => window.removeEventListener("scroll", updateScrollProgress);
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    revealElements.forEach((element, index) => {
      element.classList.add("ux-reveal");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
      revealObserver.observe(element);
    });

    const sectionElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          root.dataset.activeSection = visibleEntry.target.id;
        }
      },
      { rootMargin: "-34% 0px -52% 0px", threshold: [0.05, 0.22, 0.5] },
    );

    sectionElements.forEach((section) => sectionObserver.observe(section));

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      revealObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  return (
    <a className={showBackToTop ? "back-to-top visible" : "back-to-top"} href="#top" aria-label="Back to top">
      ↑
    </a>
  );
}

