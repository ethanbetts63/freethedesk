import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionNumber } from "@/components/SectionNumber";
import styles from "./ManualAdminCta.module.css";

export function ManualAdminCta({
  href = "/contact",
  eyebrow = "Start with the busywork",
  title = "What is manual admin actually costing you?",
  children = (
    <>
      Tell us what gets copied, chased or checked each week. We&apos;ll help you find the simplest worthwhile place to
      begin.
    </>
  ),
  buttonLabel = "Find your first automation",
}: {
  href?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  children?: React.ReactNode;
  buttonLabel?: React.ReactNode;
}) {
  return (
    <section className={`shell ${styles.closing}`}>
      <SectionNumber>{eyebrow}</SectionNumber>
      <h2>{title}</h2>
      <p>{children}</p>
      {/* Closing section, so in-page links scroll up. */}
      <PrimaryButton href={href} direction={href.startsWith("#") ? "up" : "page"} size="large">
        {buttonLabel}
      </PrimaryButton>
    </section>
  );
}
