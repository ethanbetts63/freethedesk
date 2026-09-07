import Link from "next/link";

import { GoogleLogo } from "@/components/GoogleLogo";

const checks = [
  { label: "Accessibility tree", color: "#38bdf8" },
  { label: "Stable layout", color: "#a855f7" },
  { label: "llms.txt", color: "#f472b6" },
  { label: "robots.txt access", color: "#fbbc05" },
];

export function AiReadySection() {
  return (
    <section className="ai-ready">
      <div className="shell ai-ready-inner">
        <span className="ai-ready-google"><GoogleLogo size={26} /></span>
        <p className="ai-ready-kicker">Google Lighthouse · Agentic Browsing</p>
        <h2>Is your site <span className="moving-colour-text">AI</span> ready?</h2>
        <div className="ai-ready-gauge">
          <div className="ai-ready-ring" aria-hidden="true">
            <div
              className="ai-ready-ring-spin"
              style={{ background: `conic-gradient(${checks.map((check) => check.color).join(", ")}, ${checks[0].color})` }}
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
