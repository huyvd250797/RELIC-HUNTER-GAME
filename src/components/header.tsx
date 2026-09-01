"use client";

import { useState } from "react";
import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";
import { ThemeSwitcher } from "./theme-switcher";

export function Header({ profileData = fallbackProfile }: { profileData?: PortfolioProfile }) {
  const profile = profileData;
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="scroll-progress-bar" aria-hidden="true" />
      <div className="container nav-wrap">
        <a className="brand" href="/#top" onClick={close} aria-label={`${profile.name} home`}>
          <span>{profile.shortName}</span><i>.</i>
        </a>
        <nav className={open ? "nav open" : "nav"} aria-label="Primary navigation">
          <a href="/#about" data-section="about" onClick={close}>About</a>
          <a href="/#experience" data-section="experience" onClick={close}>Experience</a>
          <a href="/#projects" data-section="projects" onClick={close}>Projects</a>
          <a href="/#skills" data-section="skills" onClick={close}>Skills</a>
          <a href="/#approach" data-section="approach" onClick={close}>Process</a>
          <a href="/resume" data-track-event="cta_click" data-track-label="Navbar Resume" onClick={close}>Resume</a>
          <a className="nav-cta" href="/contact" data-track-event="contact_click" data-track-label="Navbar Let's talk" onClick={close}>Let&apos;s talk</a>
        </nav>
        <div className="nav-actions">
          <ThemeSwitcher />
          <button className="menu-button" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            <span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
