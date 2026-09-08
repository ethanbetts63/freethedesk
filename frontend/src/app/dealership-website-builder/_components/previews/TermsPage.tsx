"use client";

import { PageHeading } from "./shared";
import styles from "../../page.module.css";

export function TermsPage() {
  return (
    <div className={`${styles.examplePage} ${styles.termsPage}`}>
      <PageHeading eyebrow="Customer information" title="Terms & conditions." detail="Last updated September 2026" />
      <div className={styles.termsIntro}>
        <strong>Clear terms make every next step easier.</strong>
        <p>
          This demonstration shows how dealership policies can be presented in a readable, well-structured format. Final
          terms would be reviewed and supplied by the dealership.
        </p>
      </div>
      <div className={styles.termsGrid}>
        <section>
          <span>01</span>
          <div>
            <h3>Vehicle enquiries and availability</h3>
            <p>
              Vehicle listings are subject to availability. Submitting an enquiry does not reserve a vehicle unless a
              deposit has been accepted and confirmed.
            </p>
          </div>
        </section>
        <section>
          <span>02</span>
          <div>
            <h3>Deposits and online purchases</h3>
            <p>
              Any applicable deposit, balance and cancellation conditions are shown clearly before the customer confirms
              an online transaction.
            </p>
          </div>
        </section>
        <section>
          <span>03</span>
          <div>
            <h3>Service and hire bookings</h3>
            <p>
              Booking times remain provisional until confirmed. Hire eligibility, identification and licence
              requirements may apply.
            </p>
          </div>
        </section>
        <section>
          <span>04</span>
          <div>
            <h3>Privacy and customer information</h3>
            <p>
              Customer information is collected only where required to respond, process a transaction or provide the
              requested dealership service.
            </p>
          </div>
        </section>
      </div>
      <div className={styles.termsHelp}>
        <span>Questions about these terms?</span>
        <strong>Contact our team for a clear answer before proceeding.</strong>
      </div>
    </div>
  );
}
