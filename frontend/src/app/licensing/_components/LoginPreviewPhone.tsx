import Image from 'next/image';

import { DeferredSignalFlow } from '@/components/visuals/DeferredSignalFlow';
import { PhoneFrame } from '@/components/visuals/PhoneFrame';

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
        <p className="m-0 mb-s flex items-center gap-2xs">
          <Image
            className="block h-[16px] w-[16px]"
            src="/logo-192x192.png"
            alt=""
            width={16}
            height={16}
          />
          <span className="text-caption font-black tracking-[-0.06em] text-text-primary [&>span]:text-text-action [&>b]:font-black [&>b]:text-action-primary">
            free<span>the</span>desk<b>.</b>
          </span>
        </p>
        <p className="m-0 mb-s text-step-0 font-heavy tracking-[-0.04em] text-surface-inverse">
          Welcome back
        </p>
        <div className="mb-xs h-[20px] rounded-xs border border-border-default bg-surface-tint" />
        <div className="mb-xs h-[20px] rounded-xs border border-border-default bg-surface-tint" />
        <div className="mt-2xs flex h-[25px] items-center justify-center rounded-xs bg-[var(--page-accent)] text-micro font-heavy text-text-on-dark">
          Sign in
        </div>
      </div>
    </PhoneFrame>
  );
}
