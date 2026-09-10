"use client";

import { useEffect, useState } from "react";

import { MovingColourButton } from "./MovingColourButton";
import styles from "./FloatingPageCta.module.css";

export function FloatingPageCta({
  label,
  href,
  showAfterId,
  hideAtId,
}: {
  label: string;
  href: string;
  showAfterId: string;
  hideAtId: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const start = document.getElementById(showAfterId);
      const end = document.getElementById(hideAtId);

      if (!start || !end) {
        setVisible(false);
        return;
      }

      const heroHasPassed = start.getBoundingClientRect().top <= 0;
      const enquiryIsApproaching = end.getBoundingClientRect().top <= window.innerHeight * 0.8;
      setVisible(heroHasPassed && !enquiryIsApproaching);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, [hideAtId, showAfterId]);

  return (
    <div className={`${styles.floating} ${visible ? styles.visible : ""}`} aria-hidden={!visible}>
      <MovingColourButton className={styles.button} href={href} direction="down">
        {label}
      </MovingColourButton>
    </div>
  );
}
