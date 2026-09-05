"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface NavMenuItem {
  href: string;
  label: string;
}

/**
 * A top-level nav item that opens a dropdown.
 *
 * Opening is driven three ways, all feeding the same CSS visibility rules:
 *   - `:hover`               — mouse pointer
 *   - `:has(:focus-visible)` — keyboard (tab to the trigger opens it,
 *                              tabbing past the last item closes it)
 *   - `[data-open="true"]`   — an explicit toggle for touch
 *
 * The touch toggle is the only reason this is a Client Component. A pure-CSS
 * hover/focus menu cannot be opened by a finger, so `onClick` handles that
 * case while mouse and keyboard keep working through CSS with no JS state.
 */
export function DesktopNavMenu({ label, items }: { label: string; items: readonly NavMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Only wired up while a menu is held open by tap — closes it on an outside
  // tap/click or Escape. Hover- and keyboard-opened menus close themselves in
  // CSS, so there is nothing to clean up for those.
  useEffect(() => {
    if (!open) return;

    function closeOnOutside(event: Event) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("touchstart", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("touchstart", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} data-open={open} className="nav-dropdown">
      <button type="button" aria-haspopup="menu" aria-expanded={open} className="nav-dropdown-trigger" onClick={() => setOpen((value) => !value)}>
        {label}
        <svg viewBox="0 0 12 8" width="10" height="7" aria-hidden="true"><path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <div role="menu" className="nav-dropdown-menu">
        {items.map((item) => (
          <Link key={item.href} role="menuitem" href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
        ))}
      </div>
    </div>
  );
}
