"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { AiReadinessBanner } from "./AiReadinessBanner";
import styles from "./AiReadinessBanner.module.css";

const MOBILE_QUERY = "(max-width: 639px)";
const PROMPT_DELAY = 60_000;
const PROMPT_STARTED_KEY = "freethedesk-ai-readiness-started";
const PROMPT_SHOWN_KEY = "freethedesk-ai-readiness-shown";

export function AiReadinessModal() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    let timer = 0;

    const schedule = () => {
      window.clearTimeout(timer);
      if (!media.matches) {
        setOpen(false);
        return;
      }
      if (sessionStorage.getItem(PROMPT_SHOWN_KEY)) return;

      const storedStart = Number(sessionStorage.getItem(PROMPT_STARTED_KEY));
      const startedAt = Number.isFinite(storedStart) && storedStart > 0 ? storedStart : Date.now();
      sessionStorage.setItem(PROMPT_STARTED_KEY, String(startedAt));

      timer = window.setTimeout(
        () => {
          if (!media.matches) return;
          sessionStorage.setItem(PROMPT_SHOWN_KEY, "true");
          setOpen(true);
        },
        Math.max(0, PROMPT_DELAY - (Date.now() - startedAt)),
      );
    };

    schedule();
    media.addEventListener("change", schedule);

    return () => {
      window.clearTimeout(timer);
      media.removeEventListener("change", schedule);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.modalBackdrop}
      onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="ai-readiness-modal-title">
        <button ref={closeRef} className={styles.modalClose} type="button" onClick={() => setOpen(false)}>
          <span aria-hidden="true">×</span>
          <span className={styles.visuallyHidden}>Close</span>
        </button>
        <AiReadinessBanner className={styles.modalBanner} titleId="ai-readiness-modal-title" />
      </div>
    </div>,
    document.body,
  );
}
