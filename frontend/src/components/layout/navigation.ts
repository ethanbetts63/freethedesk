/* Component registry: freetheplatform/frontend/registry/src/components/layout/navigation.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
export interface NavMenuItem {
  href: string;
  label: string;
}

export interface NavItem extends NavMenuItem {
  /** Present: this entry opens a dropdown on desktop and flattens on mobile. */
  items?: readonly NavMenuItem[];
}

/**
 * Two nav typographies, and only two.
 *
 * `label` is the uppercase, wide-tracked kicker allbikes and bloomprint use.
 * `body` is sentence case at body size, which freethedesk needs because its
 * labels are phrases ("Online licensing") that do not survive uppercasing at
 * 0.18em tracking inside the header width.
 *
 * This is the one appearance choice the header exposes, and it is a closed
 * set rather than a className so a fourth site has to pick one.
 */
export type NavLinkStyle = 'label' | 'body';

const LINK_BASE = 'text-text-primary transition-colors duration-200';

export const NAV_LINK: Record<NavLinkStyle, string> = {
  label: `${LINK_BASE} text-label font-strong tracking-[0.18em] uppercase hover:text-text-secondary`,
  /* The underline slides in from the left on hover and out to the right. */
  body: `${LINK_BASE} text-body font-strong relative after:absolute after:bottom-[-7px] after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-text-primary after:transition-transform after:duration-200 after:content-[''] hover:after:origin-left hover:after:scale-x-100`,
};

/** The filled CTA at the end of the desktop row. */
export const navCtaClassName =
  'inline-flex items-center bg-action-primary px-m py-s text-label font-strong tracking-[0.18em] text-text-on-dark uppercase transition-[background,transform] duration-200 hover:-translate-y-px';

/** A row in the mobile panel. */
export const mobileNavRowClassName =
  'flex min-h-[var(--tap-min)] items-center justify-between border-b border-border-default px-s text-body font-heavy text-text-primary';

/** The CTA row that closes the mobile panel. */
export const mobileNavCtaClassName =
  'mt-xs flex min-h-[var(--tap-min)] items-center justify-between border-0 bg-action-primary px-s text-body font-heavy text-text-on-dark';
