"use client";

import { useState } from "react";

import { ConversionButton, ConversionLink } from "../ConversionButton";
import { DemoMap } from "../DemoMap";
import { getDemoBrandIdentity } from "../../_lib/demoBrand";
import { PageHeading } from "./shared";
import styles from "../../_styles/preview.module.css";

export function ContactPage({ brandName }: { brandName: string }) {
  const [sent, setSent] = useState(false);
  const { email } = getDemoBrandIdentity(brandName);

  return (
    <div className={styles.examplePage}>
      <PageHeading eyebrow="Contact our team" title="How can we help?" detail="Replies within one business day" />
      <div className={styles.contactPageGrid}>
        <aside className={styles.contactPageDetails}>
          <small>Speak with the dealership</small>
          <h3>Real advice, without the runaround.</h3>
          <p>Ask about a vehicle, book a visit or tell us what you need help finding.</p>
          <ConversionLink href="tel:+61861234567">
            <span>Phone</span>
            <strong>(08) 6123 4567</strong>
          </ConversionLink>
          <ConversionLink href={`mailto:${email}`}>
            <span>Email</span>
            <strong>{email}</strong>
          </ConversionLink>
          <div>
            <span>Visit</span>
            <strong>Your dealership address</strong>
          </div>
        </aside>
        <form
          className={styles.contactForm}
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
        >
          <label>
            <span>Name</span>
            <input placeholder="Your name" />
          </label>
          <label>
            <span>Email</span>
            <input type="email" placeholder="you@email.com" />
          </label>
          <label>
            <span>Phone</span>
            <input type="tel" placeholder="04xx xxx xxx" />
          </label>
          <label>
            <span>What can we help with?</span>
            <select defaultValue="Vehicle enquiry">
              <option>Vehicle enquiry</option>
              <option>Service booking</option>
              <option>Parts</option>
              <option>Something else</option>
            </select>
          </label>
          <label className={styles.contactMessage}>
            <span>Message</span>
            <textarea placeholder="Tell us a little more..." rows={4} />
          </label>
          <ConversionButton type="submit">Send enquiry →</ConversionButton>
          {sent && <p className={styles.contactSuccess}>Thanks—your enquiry has been sent to the team.</p>}
        </form>
      </div>
      <div className={styles.contactLocation}>
        <div>
          <small>Find us</small>
          <strong>Easy to reach. Easy to park.</strong>
          <span>Mon–Fri 8:00–5:30 · Saturday 8:00–1:00</span>
        </div>
        <DemoMap className={styles.contactSimpleMap} ariaLabel="Map showing the location at a road intersection" />
      </div>
    </div>
  );
}
