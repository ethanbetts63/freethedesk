"use client";

import { FormEvent, useState } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function SignupForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/dealers/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const first = data.detail ?? Object.values(data).flat()[0];
        throw new Error(typeof first === "string" ? first : "Unable to create your account.");
      }
      form.reset();
      setStatus("success");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create your account.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="form-message form-success">
        Thanks — your account is created and waiting for approval. We review every dealership by hand,
        usually within a business day, and will email you a link to finish setting up.
      </p>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <label className="form-honeypot" aria-hidden="true">
        <span>Company website confirmation</span>
        <input name="company_website" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="field-row">
        <label><span>Business name *</span><input name="business_name" autoComplete="organization" required /></label>
        <label><span>Your name *</span><input name="contact_name" autoComplete="name" required /></label>
      </div>
      <div className="field-row">
        <label><span>Email *</span><input name="email" type="email" autoComplete="email" required /></label>
        <label><span>Phone</span><input name="phone" type="tel" autoComplete="tel" /></label>
      </div>
      <label><span>State or territory *</span><select name="state" defaultValue="WA" required><option value="WA">Western Australia</option><option value="NSW">New South Wales</option><option value="VIC">Victoria</option><option value="QLD">Queensland</option><option value="SA">South Australia</option><option value="TAS">Tasmania</option><option value="ACT">Australian Capital Territory</option><option value="NT">Northern Territory</option></select><small className="field-hint">No street address needed at this stage.</small></label>
      <label>
        <span>Password *</span>
        <input name="password" type="password" autoComplete="new-password" minLength={8} required />
        <small className="field-hint">At least 8 characters, and not something a stranger would guess.</small>
      </label>
      <button className="button button-primary form-submit" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Creating account…" : "Create account"} <span>↗</span>
      </button>
      {status === "error" && <p className="form-message form-error">{error}</p>}
    </form>
  );
}
