import { PhoneFrame } from '@/components/visuals/PhoneFrame';

export function LicensingNextStepPhone() {
  return (
    <PhoneFrame>
      <div className="relative z-2 flex h-[30px] items-center gap-2xs border-b border-border-subtle bg-surface-page px-s [&>i]:block [&>i]:h-[8px] [&>i]:w-[8px] [&>i]:rounded-[var(--radius-2xs)] [&>i]:bg-border-default">
        <i />
        <i />
        <i />
        <span className="text-label font-heavy tracking-[-0.02em] text-text-muted">
          Your Business
        </span>
      </div>
      <div className="h-full bg-surface-tint px-m py-xl text-center">
        <div className="mx-auto mb-s flex h-[34px] w-[34px] items-center justify-center rounded-[var(--radius-circle)] bg-fill-success text-body text-text-on-dark">
          ✓
        </div>
        <h4 className="m-0 mb-3xs text-lead font-control tracking-[-0.03em] text-surface-inverse">
          Vehicle selected
        </h4>
        <p className="m-0 mb-ml text-meta leading-[1.4] text-text-muted">
          Your details have been saved.
        </p>
        <div className="rounded-md border border-[var(--page-accent)] bg-surface-page p-s text-left">
          <span className="mb-3xs block text-label font-black tracking-label text-[var(--page-accent)] uppercase">
            Next step
          </span>
          <strong className="flex items-center justify-between text-small font-control text-surface-inverse">
            Online licensing <span>→</span>
          </strong>
        </div>
      </div>
    </PhoneFrame>
  );
}
