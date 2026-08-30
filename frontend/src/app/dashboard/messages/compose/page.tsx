"use client";

import Link from "next/link";
import { FormEvent, Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendMessage } from "@/lib/adminApi";

function ComposeMessageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [to, setTo] = useState(params.get("to") || "");
  const [subject, setSubject] = useState(params.get("subject") || "");
  const [body, setBody] = useState(params.get("body") || "");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const relatedEnquiry = Number(params.get("enquiry")) || undefined;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!confirm(`Send this email to ${to}?`)) return;
    setSending(true); setError("");
    try {
      await sendMessage({ to, subject, body, relatedEnquiry, attachments });
      router.push(relatedEnquiry ? `/dashboard/enquiries/${relatedEnquiry}` : "/dashboard/messages");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Email could not be sent.");
    } finally { setSending(false); }
  }

  return (
    <div className="admin-page admin-compose-page">
      <Link className="admin-back" href={relatedEnquiry ? `/dashboard/enquiries/${relatedEnquiry}` : "/dashboard/messages"}>← Back</Link>
      <section className="admin-compose-card">
        <header><div><p className="admin-kicker">Outbound message</p><h1>Compose email</h1></div>{relatedEnquiry && <span>Linked to enquiry #{relatedEnquiry}</span>}</header>
        {error && <p className="admin-banner admin-banner-error">{error}</p>}
        <form className="admin-compose-form" onSubmit={submit}>
          <label>To<input type="email" value={to} onChange={(event) => setTo(event.target.value)} required /></label>
          <label>Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} required /></label>
          <label>Email body<textarea rows={18} value={body} onChange={(event) => setBody(event.target.value)} required /></label>
          <section className="admin-attachments">
            <div><strong>Attachments</strong><small>Up to 10 files; 20 MB each and 24 MB total.</small></div>
            <button type="button" onClick={() => inputRef.current?.click()}>Attach files</button>
            <input ref={inputRef} type="file" multiple hidden onChange={(event) => { setAttachments((current) => [...current, ...Array.from(event.target.files ?? [])]); event.target.value = ""; }} />
            {attachments.length > 0 && <ul>{attachments.map((file, index) => <li key={`${file.name}-${index}`}><span>{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</span><button type="button" onClick={() => setAttachments((current) => current.filter((_, currentIndex) => currentIndex !== index))}>Remove</button></li>)}</ul>}
          </section>
          <button className="admin-primary-button admin-send-button" disabled={sending}>{sending ? "Sending…" : "Send email"}</button>
        </form>
      </section>
    </div>
  );
}

export default function ComposeMessagePage() {
  return <Suspense fallback={<div className="admin-page"><p className="admin-empty">Loading composer…</p></div>}><ComposeMessageContent /></Suspense>;
}
