import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Create a Dealer Account",
  description: "Set up a Free the Desk online licensing account for your dealership.",
};

export default function DealerSignupPage() {
  return (
    <main className="contact-page">
      <section className="shell contact-grid">
        <div className="contact-copy">
          <p className="eyebrow"><span />Dealer signup</p>
          <h1>Create your dealer account.</h1>
          <p className="hero-lead">
            Basic account details now. The rest — your licence details, the paperwork we prefill for you and the sale
            conditions you want to use — comes after we approve the account.
          </p>
          <div className="contact-detail"><span>01</span><div><strong>We review every dealership</strong><p>By hand, usually within a business day. We check the business is licensed and that online licensing suits how you sell.</p></div></div>
          <div className="contact-detail"><span>02</span><div><strong>Nothing is committed</strong><p>Creating an account costs nothing and starts no subscription. You will see the whole flow before you decide.</p></div></div>
          <div className="contact-direct">
            <small>Questions first?</small>
            <a href="mailto:hello@freethedesk.com.au">hello@freethedesk.com.au</a>
            <span>Currently WA motorcycle and moped dealers · <Link href="/dealers">How it works</Link></span>
          </div>
        </div>
        <div className="contact-form-wrap">
          <h2>Your details.</h2>
          <p>This creates the login for your dealership.</p>
          <SignupForm />
        </div>
      </section>
    </main>
  );
}
