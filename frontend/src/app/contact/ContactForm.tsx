"use client";

import { FormEvent, useState } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/enquiries/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Unable to submit enquiry");
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="contact-form" onSubmit={submitEnquiry}>
      <label className="form-honeypot" aria-hidden="true">
        <span>Company website confirmation</span>
        <input name="company_website" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="field-row">
        <label><span>Your name *</span><input name="name" autoComplete="name" required /></label>
        <label><span>Business name *</span><input name="business" autoComplete="organization" required /></label>
      </div>
      <div className="field-row">
        <label><span>Email *</span><input name="email" type="email" autoComplete="email" required /></label>
        <label><span>Phone</span><input name="phone" type="tel" autoComplete="tel" /></label>
      </div>
      <label><span>Current website</span><input name="website" type="url" placeholder="https://" /></label>
      <label><span>What can we help with? *</span>
        <select name="help_with" defaultValue="" required>
          <option value="" disabled>Select one</option>
          <option value="website">A new or improved dealer website</option>
          <option value="inventory">Inventory, parts, service or hire</option>
          <option value="automation">Business automation</option>
          <option value="everything">All of the above</option>
          <option value="unsure">I am not sure yet</option>
        </select>
      </label>
      <label><span>What is currently taking too much time or not working well? *</span><textarea name="message" rows={6} required /></label>
      <button className="button button-primary form-submit" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send enquiry"} <span>↗</span>
      </button>
      {status === "success" && <p className="form-message form-success">Thanks — your enquiry is in. We’ll review it and get back to you during business hours.</p>}
      {status === "error" && <p className="form-message form-error">Something went wrong. Please email hello@freethedesk.com.au instead.</p>}
    </form>
  );
}
