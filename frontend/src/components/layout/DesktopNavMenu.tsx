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
 * A top-level nav item that opens a dropdown, driven three ways into the same classes:
 * `group-hover` (mouse), `group-has-[:focus-visible]` (keyboard), `group-data-[open=true]` (touch toggle).
 *
 * The touch toggle is why this is a Client Component: iPadOS never fires `hover` or `:focus-visible` from a tap,
 * and it gets the desktop layout, so it never sees the hamburger.
 *
 * Not `role="menu"`, which promises an arrow-key model this lacks; `aria-expanded` is the whole contract.
 * `:focus-visible` rather than `:focus-within`, which stayed pinned open after client-side navigation.
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
      {/* Always in the DOM so CSS drives it; `invisible` not `hidden`, so keyboard focus can reach the links and trigger the focus-visible rule. */}
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
