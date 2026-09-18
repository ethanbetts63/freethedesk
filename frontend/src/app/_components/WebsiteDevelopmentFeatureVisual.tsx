import { cn } from '@/lib/utils';
import { TrafficLights } from '@/components/visuals/chrome';

/**
 * A website drawn inside a browser, with the systems behind it shown as a
 * panel overlapping the bottom-right corner — the point of the illustration
 * being that the two are one thing.
 *
 * The nav block, the eyebrow and the step numbers are all --action-primary,
 * so they stay one colour rather than three.
 */
const browserBarClassName =
  'grid h-[38px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center bg-surface-tint-strong px-s text-caption-xs text-text-muted';

const systemRowClassName =
  'grid grid-cols-[25px_minmax(0,1fr)_auto] items-center gap-xs border-b border-border-subtle py-xs text-caption last:border-b-0 [&>i]:text-caption-xs [&>i]:font-black [&>i]:not-italic [&>i]:text-action-primary [&>strong]:text-caption-xs [&>strong]:text-text-success [&>strong]:uppercase';

export function WebsiteDevelopmentFeatureVisual() {
  return (
    <div
      className={cn(
        'relative min-h-[450px] bg-surface-dark px-s pt-xl pb-ml shadow-block-s',
        'sm:min-h-[520px] sm:p-xl sm:shadow-block-l',
      )}
      aria-hidden="true"
    >
      <div className={browserBarClassName}>
        <TrafficLights />
        {/* The address pill's wide side padding used to force the bar past its
            box, which is what the overflow rules are guarding against. */}
        <span className="overflow-hidden bg-surface-page px-m py-3xs text-ellipsis whitespace-nowrap sm:px-xl">
          yourbusiness.com.au
        </span>
        <b className="justify-self-end text-caption-xs tracking-label text-text-success uppercase">
          Live
        </b>
      </div>
      <div className="min-h-[330px] overflow-hidden bg-surface-page px-s pt-m pb-2xl text-text-secondary sm:min-h-[360px] sm:px-l sm:pt-ml sm:pb-2xl">
        <nav className="flex items-center justify-between">
          <strong className="text-body tracking-[-0.06em] [&>span]:text-action-primary">
            your<span>business</span>.
          </strong>
          <div className="flex gap-xs [&>i]:block [&>i]:h-[5px] [&>i]:w-[30px] [&>i]:bg-surface-tint-strong [&>b]:block [&>b]:h-[13px] [&>b]:w-[38px] [&>b]:bg-action-primary">
            <i />
            <i />
            <b />
          </div>
        </nav>
        {/* The sphere is a ::after so it can bleed past the hero's right edge
            without a wrapper, and sits under the copy by paint order. */}
        <div className="relative mt-m min-h-[210px] px-ml py-l [background:linear-gradient(135deg,var(--surface-tint),var(--slate-50))] after:absolute after:top-[45px] after:right-[-16px] after:h-[110px] after:w-[110px] after:rounded-circle after:opacity-[0.72] after:content-[''] after:[background:radial-gradient(circle_at_35%_35%,var(--sky-500),var(--action-primary)_60%,var(--surface-dark))] sm:min-h-[215px] sm:p-xl sm:after:top-[26px] sm:after:right-[7%] sm:after:h-[155px] sm:after:w-[155px] sm:after:opacity-[0.92]">
          <small className="block text-caption-xs font-black tracking-label text-action-primary uppercase">
            A clear path forward
          </small>
          {/* Off the display scale on purpose: mock website content inside an
              illustration, not page type. Revisit with container queries. */}
          <strong className="relative z-1 mt-m mb-ml block text-display-sm leading-[0.9] tracking-[-0.065em]">
            Make the next
            <br />
            step obvious.
          </strong>
          <span className="relative z-1 inline-block bg-surface-inverse px-s py-xs text-caption-xs font-heavy text-text-on-dark">
            Get started →
          </span>
        </div>
        <div className="mt-s grid grid-cols-3 gap-xs [&>i]:block [&>i]:h-[42px] [&>i]:bg-surface-tint-strong">
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="absolute right-[8px] bottom-0 w-[82%] translate-y-[15px] border border-border-default bg-surface-page p-m text-surface-dark shadow-contrast-m sm:right-0 sm:w-[min(330px,72%)] sm:translate-x-[18px] sm:translate-y-[18px]">
        <header className="mb-2xs flex items-center justify-between border-b border-border-subtle pb-s text-caption-sm font-black tracking-label-tight uppercase">
          <span>Behind the website</span>
          <b className="text-text-success">Working</b>
        </header>
        {[
          ['01', 'Form routed'],
          ['02', 'CRM updated'],
          ['03', 'Follow-up sent'],
        ].map(([index, label]) => (
          <div key={index} className={systemRowClassName}>
            <i>{index}</i>
            <span>{label}</span>
            <strong>Done</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
