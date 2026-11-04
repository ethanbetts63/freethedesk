import { BookOpen, Car, FileText, Globe, Search, Workflow } from 'lucide-react';

const ICON_CLASS = 'size-[48px] text-text-action';

/** The mark on a guide's hero until it has a picture. */
export const GUIDE_PLACEHOLDER = (
  <BookOpen className="size-[72px] text-text-action" strokeWidth={1.25} />
);

/** The related card's mark, for a page with no picture: what the page sells, by its address. Pale, like the pictures. */
export function guideIconFor(href: string) {
  if (href.startsWith('/seo/sample-report'))
    return <FileText className={ICON_CLASS} strokeWidth={1.25} />;
  if (href.startsWith('/seo')) return <Search className={ICON_CLASS} strokeWidth={1.25} />;
  if (href.startsWith('/automation')) return <Workflow className={ICON_CLASS} strokeWidth={1.25} />;
  if (href.startsWith('/dealers') || href.startsWith('/licensing'))
    return <Car className={ICON_CLASS} strokeWidth={1.25} />;
  if (href.startsWith('/portfolio')) return <FileText className={ICON_CLASS} strokeWidth={1.25} />;
  if (href.startsWith('/website')) return <Globe className={ICON_CLASS} strokeWidth={1.25} />;
  return <BookOpen className={ICON_CLASS} strokeWidth={1.25} />;
}
