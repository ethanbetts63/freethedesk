"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { AiReadinessBanner } from "./AiReadinessBanner";
import styles from "./AiReadinessBanner.module.css";

/**
 * The prompt itself, loaded on demand. Mounted only while open, so the effect
 * that locks the page and listens for Escape runs for exactly that window.
 */
export function AiReadinessDialog({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.modalBackdrop} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="ai-readiness-modal-title">
        <button ref={closeRef} className={styles.modalClose} type="button" onClick={onClose}>
          <span aria-hidden="true">×</span>
          <span className={styles.visuallyHidden}>Close</span>
        </button>
        <AiReadinessBanner className={styles.modalBanner} titleId="ai-readiness-modal-title" />
      </div>
    </div>,
    document.body,
  );
}
