import { PrimaryButton } from "@/components/PrimaryButton";
import styles from "./ManualAdminCta.module.css";

export function ManualAdminCta({
  href = "/contact",
  label = "Find your first automation",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <section className={`shell ${styles.closing}`}>
      <p className={styles.label}>Start with the busywork</p>
      <h2>What is manual admin actually costing you?</h2>
      <p>
        Tell us what gets copied, chased or checked each week. We&apos;ll help you find the simplest worthwhile place to
        begin.
      </p>
      {/* This is always the closing section, so an on-page target is above it. */}
      <PrimaryButton className={styles.closingCta} href={href} direction={href.startsWith("#") ? "up" : "page"}>
        {label}
      </PrimaryButton>
    </section>
  );
}
