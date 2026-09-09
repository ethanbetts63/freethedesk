/**
 * Smoothly bring an in-page section into view and move focus to it, without
 * touching the URL.
 *
 * In-page CTAs used to be `<a href="#signup">`. A hash link only fires once:
 * the first click changes `location.hash` and the browser scrolls, but every
 * click after that targets the hash the page is already on, so nothing happens
 * until the hash changes again. Driving the scroll ourselves makes the CTA work
 * on every click and keeps the address bar clean.
 *
 * Returns false when the target isn't in the DOM yet, so a caller can fall back
 * to default anchor behaviour (e.g. a deep link that resolves after navigation).
 */
export function scrollToId(id: string): boolean {
  const target = document.getElementById(id);
  if (!target) return false;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });

  // The section isn't natively focusable, so keyboard and screen-reader users
  // would stay on the CTA while the page scrolled away from them. Make it
  // focusable just for this interaction and drop the attribute again on blur.
  target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });

  return true;
}
