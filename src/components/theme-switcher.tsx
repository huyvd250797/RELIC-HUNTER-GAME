"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const themes: Theme[] = ["light", "dark", "system"];

const icons: Record<Theme, string> = {
  light: "☀",
  dark: "◐",
  system: "◒",
};

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-theme") as Theme | null;
    setTheme(saved && themes.includes(saved) ? saved : "system");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const resolved = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      root.dataset.theme = resolved;
      root.style.colorScheme = resolved;
    };

    applyTheme();
    window.localStorage.setItem("portfolio-theme", theme);
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  const cycle = () => {
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
  };

  return (
    <button className="theme-toggle" onClick={cycle} aria-label={`Theme: ${theme}`} title={`Theme: ${theme}`}>
      <span aria-hidden="true">{icons[theme]}</span>
      <span className="theme-label">{theme}</span>
    </button>
  );
}
