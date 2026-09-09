"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 639px)";
const PROMPT_DELAY = 60_000;
const PROMPT_STARTED_KEY = "freethedesk-ai-readiness-started";
const PROMPT_SHOWN_KEY = "freethedesk-ai-readiness-shown";

/* The prompt only ever opens on a narrow viewport, a minute in. Fetching it on
   demand keeps the dialog, the banner and its form out of the initial download
   on every page - and off desktop entirely, where the timer never fires. */
const AiReadinessDialog = dynamic(() => import("./AiReadinessDialog").then((m) => m.AiReadinessDialog), {
  ssr: false,
});

export function AiReadinessModal() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

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

  return open ? <AiReadinessDialog onClose={close} /> : null;
}
