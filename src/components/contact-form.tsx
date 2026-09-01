"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { profile as fallbackProfile, type PortfolioProfile } from "@/data/profile";

export function ContactForm({ profileData = fallbackProfile }: { profileData?: PortfolioProfile }) {
  const profile = profileData;
  const [form, setForm] = useState(() => ({
    name: "",
    email: "",
    topic: profile.contact.preferredTopics[0] ?? "General message",
    message: "",
  }));
  const [submitted, setSubmitted] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (submitted) setSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = `Portfolio contact — ${form.topic}`;
    const body = [
      `Name: ${form.name || "Not provided"}`,
      `Email: ${form.email || "Not provided"}`,
      `Topic: ${form.topic}`,
      "",
      form.message || "Please add your message here.",
    ].join("\n");

    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          <span>Name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </label>
        <label>
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </label>
      </div>

      <label>
        <span>Topic</span>
        <select
          name="topic"
          value={form.topic}
          onChange={(event) => updateField("topic", event.target.value)}
        >
          {profile.contact.preferredTopics.map((topic) => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
      </label>

      <label>
        <span>Message</span>
        <textarea
          name="message"
          rows={6}
          placeholder="Short context, goal, timeline or opportunity details..."
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
        />
      </label>

      <div className="contact-form-actions">
        <button type="submit" data-track-event="contact_click" data-track-label="Contact form mailto">Open email draft ↗</button>
        <p>{submitted ? "Your email app should open with a prepared message." : "No backend required — this creates a mailto draft."}</p>
      </div>
    </form>
  );
}
