'use client';

/* Component registry: freetheplatform/frontend/registry/src/components/layout/DesktopNavMenu.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import Link from 'next/link';

import { NAV_LINK, type NavLinkStyle, type NavMenuItem } from '@/components/layout/navigation';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/utils';

const MENU_LINK =
  'block px-m py-s text-label font-strong tracking-[0.18em] text-text-primary uppercase transition-colors hover:bg-surface-tint hover:text-text-secondary';

/**
 * A top-level nav item that opens a dropdown.
 *
 * Opening is driven three ways, all feeding the same visibility classes:
 *   - `group-hover`                — mouse pointer
 *   - `group-has-[:focus-visible]` — keyboard
 *   - `group-data-[open=true]`     — an explicit toggle for touch
 *
 * The touch toggle is the only reason this is a Client Component: iPadOS
 * never fires `hover` or matches `:focus-visible` from a tap, and iOS Safari
 * doesn't even focus a `<button>` on tap, so a pure-CSS menu was unreachable
 * on an iPad — which gets the desktop layout at 1024px and so never sees the
 * hamburger fallback.
 *
 * Deliberately NOT `role="menu"`/`role="menuitem"` — those promise an
 * application-menu keyboard model (arrow keys, Home/End, typeahead) this
 * doesn't implement. This is a list of links; `aria-expanded` on the trigger
 * is the whole contract it needs.
 *
 * `:focus-visible` rather than `:focus-within`: navigation is client side so
 * the header never remounts, and a clicked menu link stays focused — a
 * `:focus-within` menu stayed pinned open on the next page.
 */
export default function DesktopNavMenu({
  label,
  items,
  linkStyle = 'label',
}: {
  label: string;
  items: readonly NavMenuItem[];
  linkStyle?: NavLinkStyle;
}) {
  const { open, toggle, ref } = useDisclosure<HTMLDivElement>();

  return (
    <div ref={ref} data-open={open} className="group relative flex h-full items-center">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={toggle}
        className={cn(
          NAV_LINK[linkStyle],
          'flex items-center gap-2xs bg-transparent',
          linkStyle === 'label' &&
            'px-s py-2xs group-hover:bg-surface-tint group-hover:text-text-secondary group-has-[:focus-visible]:bg-surface-tint group-has-[:focus-visible]:text-text-secondary group-data-[open=true]:bg-surface-tint group-data-[open=true]:text-text-secondary',
        )}
      >
        {label}
        <span
          aria-hidden="true"
          className="h-0 w-0 flex-none border-x-[5px] border-t-[6px] border-x-transparent border-t-action-primary transition-transform duration-200 group-hover:rotate-180 group-has-[:focus-visible]:rotate-180 group-data-[open=true]:rotate-180 motion-reduce:transition-none"
        />
      </button>
      {/* Kept in the DOM rather than mounted on open, which is what lets CSS do
          the work. `invisible` rather than `hidden` so the links stay in the
          tab order path that triggers the focus-visible rule. */}
      <ul className="invisible absolute top-full left-0 z-50 m-0 min-w-52 list-none overflow-hidden border border-border-default bg-surface-page py-2xs pl-0 opacity-0 shadow-xl transition-opacity group-hover:visible group-hover:opacity-100 group-has-[:focus-visible]:visible group-has-[:focus-visible]:opacity-100 group-data-[open=true]:visible group-data-[open=true]:opacity-100">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={MENU_LINK}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
