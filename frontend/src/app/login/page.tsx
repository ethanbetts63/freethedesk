"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function LoginContent() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace(search.get("next") || "/dashboard/enquiries");
  }, [loading, router, search, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitting(true); setError("");
    try {
      await login(String(data.get("identifier")), String(data.get("password")));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Login failed.");
    } finally { setSubmitting(false); }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <Link className="login-brand" href="/">free<span>the</span>desk<i>.</i></Link>
        <p className="admin-kicker">Staff access</p>
        <h1>Admin dashboard</h1>
        <p className="login-intro">Sign in to review enquiries and send messages.</p>
        <form onSubmit={submit}>
          <label>Username or email<input name="identifier" autoComplete="username" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          {error && <p className="admin-form-error">{error}</p>}
          <button className="admin-primary-button" disabled={submitting || loading}>{submitting ? "Signing in…" : "Sign in"}</button>
        </form>
        <Link className="login-back" href="/">← Back to website</Link>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="admin-loading">Loading sign in…</div>}><LoginContent /></Suspense>;
}
