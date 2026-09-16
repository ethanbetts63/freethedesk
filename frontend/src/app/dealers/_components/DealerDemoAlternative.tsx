import Link from 'next/link';

export function DealerDemoAlternative() {
  return (
    <p className="mt-ml flex items-center justify-center gap-xs text-small">
      <span className="text-text-muted">or</span>
      <Link
        href="/dealership-website-builder"
        className="border-b border-[var(--page-accent,var(--action-primary))] pb-4xs font-heavy text-[var(--page-accent,var(--action-primary))]"
      >
        Try the dealer demo ↗
      </Link>
    </p>
  );
}
