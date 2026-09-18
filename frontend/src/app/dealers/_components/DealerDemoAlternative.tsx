import Link from 'next/link';

export function DealerDemoAlternative() {
  return (
    <p className="mt-ml flex items-center justify-center gap-xs text-body-sm">
      <span className="text-text-muted">or</span>
      <Link
        href="/dealership-website-builder"
        className="border-b border-action-primary pb-4xs font-heavy text-action-primary"
      >
        Try the dealer demo ↗
      </Link>
    </p>
  );
}
