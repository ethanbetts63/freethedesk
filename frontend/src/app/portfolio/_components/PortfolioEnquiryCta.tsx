import { CtaButton } from '@/components/CtaButton';
import { cn } from '@/lib/utils';

/**
 * `flush` is the hero's copy block, where the button follows a meta row that
 * already carries the gap. Everywhere else it opens its own space.
 */
export function PortfolioEnquiryCta({ flush = false }: { flush?: boolean }) {
  return (
    <CtaButton className={cn(!flush && 'mt-xl')} href="#enquiry" direction="down">
      See our options
    </CtaButton>
  );
}
