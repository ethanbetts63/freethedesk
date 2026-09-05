import type { InventoryOption, ModuleKey } from "./types";

type IconType = ModuleKey | InventoryOption;

export function CapabilityIcon({ type }: { type: IconType }) {
  if (type === "inventory") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 7.5h17v10h-17zM7 17.5v2m10-2v2M6.5 13.5h.01m11 0h.01M7 7.5l2-3h6l2 3" /></svg>;
  }
  if (type === "accessories") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8.5h12l1 11H5l1-11Zm3 1v-3a3 3 0 0 1 6 0v3" /></svg>;
  }
  if (type === "parts") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.3 4.2 10 2h4l.7 2.2 2 .8 2.1-1.1 2.2 2.8-1.5 1.8.3 2.2 2.2 1v3.6l-2.2 1-.3 2.2 1.5 1.8-2.2 2.8-2.1-1.1-2 .8L14 23h-4l-.7-2.2-2-.8-2.1 1.1L3 18.3l1.5-1.8-.3-2.2-2.2-1v-3.6l2.2-1 .3-2.2L3 4.7l2.2-2.8L7.3 3l2 .8Z" /><circle cx="12" cy="12.5" r="3.2" /></svg>;
  }
  if (type === "service") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5v4m14-4v4M3.5 7h17v13h-17zM7 11h3v3H7zm7 0h3m-3 4h3" /></svg>;
  }
  if (type === "hire") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="10" r="4" /><path d="m11 13 8 8m-3-3 2-2m-5-1 2-2" /></svg>;
  }
  if (type === "articles") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2.5h10l4 4v15H5zM15 2.5v5h4M8 12h8m-8 4h8" /></svg>;
  }
  if (type === "seo") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20.5h18M5.5 18V12h3v6m3 0V8h3v10m3 0V3.5h3V18M5 7l5-4 4 2 5-3" /></svg>;
  }
  if (type === "integrations") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 14.5 14.5 9M8 17H6a4 4 0 0 1 0-8h3m6-2h3a4 4 0 0 1 0 8h-3" /></svg>;
  }
  if (type === "purchase") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5h18v13H3zM3 9h18M7 15h4" /></svg>;
  }
  if (type === "contract") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2.5h10l4 4v15H5zM15 2.5v5h4M8 12h7m-7 4h4m3.5 1.5 1.5 1.5 3-4" /></svg>;
  }
  if (type === "newsletter") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5h18v13H3zM3 7l9 7 9-7M7 3.5h10" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M13 9h4m-4 3h4M7 16h10" /></svg>;
}
