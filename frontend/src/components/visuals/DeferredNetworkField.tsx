"use client";

import dynamic from "next/dynamic";

import { useHostVisible } from "./useHostVisible";

/* Canvas paints nothing server-side, so deferring costs no markup. */
const NetworkField = dynamic(() => import("./NetworkField").then((m) => m.NetworkField), { ssr: false });

/**
 * NetworkField, fetched only once its container is on screen. The hero wrapper
 * is `display: none` below 900px, so a phone never downloads the node field.
 */
export function DeferredNetworkField() {
  const { sentinel, visible } = useHostVisible();
  return visible ? <NetworkField /> : <span ref={sentinel} />;
}
