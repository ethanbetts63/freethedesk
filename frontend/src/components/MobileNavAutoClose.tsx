"use client";

import { useEffect, useRef } from "react";

/**
 * Closes the hamburger panel once a link inside it is followed. Next navigates
 * client-side, so the panel would otherwise stay open over the page the link
 * just went to.
 *
 * Deliberately the only client code in the header: the panel itself is a native
 * <details>, so it opens and closes without any JavaScript at all, and the nav
 * markup stays on the server. One delegated listener replaces an onClick per
 * link, and it does not exist above 900px where the panel is display: none.
 */
export function MobileNavAutoClose() {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const menu = anchor.current?.closest("details");
    if (!menu) return;

    const close = (event: MouseEvent) => {
      if ((event.target as HTMLElement | null)?.closest("a")) menu.open = false;
    };
    menu.addEventListener("click", close);
    return () => menu.removeEventListener("click", close);
  }, []);

  return <span ref={anchor} hidden />;
}
