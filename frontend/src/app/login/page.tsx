"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { homeFor } from "@/lib/api";
import { SignalFlow } from "../home-v3/SignalFlow";

function LoginContent() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Already signed in: honour ?next= only when it belongs to this principal's
  // portal, otherwise a staff link would strand a dealer on a page they cannot
  // load, and vice versa.
  useEffect(() => {
    if (loading || !user) return;
    const next = search.get("next");
    const home = homeFor(user);
    const prefix = user.role === "staff" ? "/dashboard" : "/portal";
    router.replace(next && next.startsWith(prefix) ? next : home);
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
      <div className="login-signal-flow"><SignalFlow /></div>
      <section className="login-card">
        <Link className="login-brand" href="/">free<span>the</span>desk<i>.</i></Link>
        <p className="admin-kicker">Sign in</p>
        <h1>Welcome back</h1>
        <p className="login-intro">Dealers and staff sign in here — we will take you to the right place.</p>
        <form onSubmit={submit}>
          <label>Email<input name="identifier" autoComplete="username" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          {error && <p className="admin-form-error">{error}</p>}
          <button className="admin-primary-button" disabled={submitting || loading}>{submitting ? "Signing in…" : "Sign in"}</button>
        </form>
        <p className="login-alt">No dealer account yet? <Link href="/licensing#signup">Create one</Link></p>
        <Link className="login-back" href="/">← Back to website</Link>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="admin-loading">Loading sign in…</div>}><LoginContent /></Suspense>;
}
