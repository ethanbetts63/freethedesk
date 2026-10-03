import { DeferredSignalFlow } from '@/components/visuals/DeferredSignalFlow';
import { PhoneFrame } from '@/components/visuals/PhoneFrame';
import { Wordmark } from '@/components/Wordmark';

/* No "use client": SignalFlow carries its own boundary, so the phone markup
   around it renders on the server. */
export function LoginPreviewPhone() {
  return (
    <PhoneFrame>
      <div className="absolute inset-0 opacity-80 [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full">
        <DeferredSignalFlow />
      </div>
      {/* The same graph paper as the real sign-in screen, drawn at 18px
          because this is a phone at a quarter size. Line colour comes from
          --tint-grid so the miniature cannot drift from the thing it depicts. */}
      <div className="absolute inset-0 [background-image:linear-gradient(var(--tint-grid)_1px,transparent_1px),linear-gradient(90deg,var(--tint-grid)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute top-[68px] right-[14px] left-[14px] rounded-md border border-[color-mix(in_srgb,var(--border-strong)_85%,transparent)] bg-[color-mix(in_srgb,var(--surface-page)_94%,transparent)] px-s py-m shadow-contrast-s">
        <Wordmark size="mini" className="mb-s" />
        <p className="m-0 mb-s text-lead font-heavy tracking-[-0.04em] text-surface-inverse">
          Welcome back
        </p>
        <div className="mb-xs h-[20px] rounded-xs border border-border-default bg-surface-tint" />
        <div className="mb-xs h-[20px] rounded-xs border border-border-default bg-surface-tint" />
        <div className="mt-2xs flex h-[25px] items-center justify-center rounded-xs bg-action-primary text-label font-heavy text-text-on-dark">
          Sign in
        </div>
      </div>
    </PhoneFrame>
  );
}
