/* Component registry: freetheplatform/frontend/registry/src/lib/scrollToId.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
/**
 * Scroll an in-page section into view and focus it, without touching the URL. A hash link only fires once
 * (later clicks target the hash already there).
 * Returns false when the target is not in the DOM, so a caller can fall back to the anchor.
 */
export function scrollToId(id: string): boolean {
  const target = document.getElementById(id);
  if (!target) return false;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });

  // Focusable only for this interaction, so keyboard and screen-reader users follow the scroll.
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });

  return true;
}
