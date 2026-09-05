import Link from "next/link";

const checks = [
  { label: "Accessibility tree", color: "#38bdf8" },
  { label: "Stable layout", color: "#a855f7" },
  { label: "llms.txt", color: "#f472b6" },
];

export function AiReadySection() {
  return (
    <section className="ai-ready">
      <div className="shell ai-ready-inner">
        <svg className="ai-ready-google" aria-hidden="true" viewBox="0 0 48 48" width="26" height="26">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
        <p className="ai-ready-kicker">Google Lighthouse · Agentic Browsing</p>
        <h2>Is your site <span className="ai-ready-ai">AI</span> ready?</h2>
        <div className="ai-ready-gauge">
          <div className="ai-ready-ring" aria-hidden="true">
            <div
              className="ai-ready-ring-spin"
              style={{ background: `conic-gradient(${checks[0].color}, ${checks[1].color}, ${checks[2].color}, ${checks[0].color})` }}
            />
            <div className="ai-ready-ring-hole"><span>?</span></div>
          </div>
          <ul className="ai-ready-checks">
            {checks.map((check) => <li key={check.label}><i aria-hidden="true" style={{ background: check.color, color: check.color }} />{check.label}</li>)}
          </ul>
        </div>
        <p className="ai-ready-caption">Chances are yours hasn&apos;t been checked.</p>
        <Link className="button ai-ready-cta" href="/contact">Find out where you stand <span>↗</span></Link>
      </div>
    </section>
  );
}
