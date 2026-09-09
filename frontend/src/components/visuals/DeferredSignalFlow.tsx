"use client";

import dynamic from "next/dynamic";

import { useHostVisible } from "./useHostVisible";

/* Canvas paints nothing server-side, so deferring costs no markup. */
const SignalFlow = dynamic(() => import("./SignalFlow").then((m) => m.SignalFlow), { ssr: false });

/** SignalFlow, fetched only once its container is on screen. */
export function DeferredSignalFlow({ smooth = false }: { smooth?: boolean }) {
  const { sentinel, visible } = useHostVisible();
  return visible ? <SignalFlow smooth={smooth} /> : <span ref={sentinel} />;
}
