import Image from "next/image";
import Link from "next/link";

import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionNumber } from "@/components/SectionNumber";
import styles from "./CaseStudyTeaser.module.css";

type CaseStudyTeaserProps = {
  eyebrow: string;
  title?: string;
  children: React.ReactNode;
  points: readonly string[];
  primaryHref: string;
  primaryLabel: string;
  showPrimaryAction?: boolean;
};

export function CaseStudyTeaser({
  eyebrow,
  title = "Scooter Shop, Perth.",
  children,
  points,
  primaryHref,
  primaryLabel,
  showPrimaryAction = true,
}: CaseStudyTeaserProps) {
  return (
    <section className={styles.section}>
      <div className={`shell ${styles.inner}`}>
        <div className={styles.phone}>
          <div className={styles.statOverlay}>
            <small>Google Search Console</small>
            <strong>+200%</strong>
            <span>organic clicks</span>
          </div>
          <div className={styles.phoneFrame}>
            <div className="case-mobile-phone">
              <span />
              <div className="case-phone-menu" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <Image
                src="/case-studies/scooter-shop/inventory-mobile.png"
                alt="Scooter Shop inventory page on mobile"
                width={390}
                height={844}
              />
            </div>
          </div>
        </div>
        <div className={styles.copy}>
          <SectionNumber onDark>{eyebrow}</SectionNumber>
          <h2>{title}</h2>
          {children}
          <div className={styles.points}>
            {points.map((point) => (
              <span key={point}>{point}</span>
            ))}
          </div>
          <div className={styles.actions}>
            {showPrimaryAction && (
              <PrimaryButton href={primaryHref} direction="down" size="compact">
                {primaryLabel}
              </PrimaryButton>
            )}
            <Link href="/portfolio/scooter-shop">
              Read the full case study <span>↗</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
