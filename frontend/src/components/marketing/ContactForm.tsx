"use client";

import { FormEvent, useState } from "react";

import { submitEnquiry, type HelpWith } from "@/lib/api";

type FormStatus = "idle" | "submitting" | "success" | "error";

   
                                                                             
                                                                             
                                                
   
const HELP_WITH_OPTIONS: { value: HelpWith; label: string }[] = [
  { value: "website", label: "A new or improved business website" },
  { value: "website_builder", label: "A new or improved dealer website" },
  { value: "inventory", label: "Inventory, parts, service or hire" },
  { value: "automation", label: "Business automation" },
  { value: "everything", label: "All of the above" },
  { value: "unsure", label: "I am not sure yet" },
];

export function ContactForm({ defaultHelpWith = "" }: { defaultHelpWith?: HelpWith | "" } = {}) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");
    const form = event.currentTarget;
    const values = new FormData(form);
    const text = (field: string) => String(values.get(field) ?? "");

    try {
      await submitEnquiry({
        name: text("name"),
        email: text("email"),
        message: text("message"),
        help_with: text("help_with") as HelpWith,
        website: text("website"),
        company_website: text("company_website"),
      });
      form.reset();
      setStatus("success");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "");
      setStatus("error");
    }
  }

  return (
    <form className="contact-form" onSubmit={send}>
      <label className="form-honeypot" aria-hidden="true">
        <span>Company website confirmation</span>
        <input name="company_website" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="field-row">
        <label>
          <span>Your name *</span>
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          <span>Email *</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
      </div>
      <label>
        <span>Current website</span>
        <input name="website" type="url" placeholder="https://" />
      </label>
      <label>
        <span>What can we help with? *</span>
        <select name="help_with" defaultValue={defaultHelpWith} required>
          <option value="" disabled>
            Select one
          </option>
          {HELP_WITH_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>What is currently taking too much time or not working well? *</span>
        <textarea name="message" rows={6} required />
      </label>
      <button className="button button-primary form-submit" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send enquiry"} <span>→</span>
      </button>
      {status === "success" && (
        <p className="form-message form-success">
          Thanks — your enquiry is in. We’ll review it and get back to you during business hours.
        </p>
      )}
      {status === "error" && (
        <p className="form-message form-error">
          {error || "Something went wrong."} Please try again, or email hello@freethedesk.com.au instead.
        </p>
      )}
    </form>
  );
}
