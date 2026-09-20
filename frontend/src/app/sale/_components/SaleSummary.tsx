'use client';

import { StatusPill } from '@/components/dashboard/StatusPill';
import { DetailItem, cardClassName } from '@/components/ui/Card';

import type { CustomerSale } from '@/lib/saleApi';
import { formatMoney } from '@/lib/formatting';

/**
 * What the customer can always see, on every step, in a panel that does not
 * move: the vehicle, the price, the dealer, the reference and the status in
 * plain words.
 *
 * After signing, that status is a live answer to the only question they will
 * actually have — has the dealer accepted yet — and cl 1.3 makes it a real
 * question rather than an anxious one. Offers do lapse.
 */
export function SaleSummary({ sale }: { sale: CustomerSale }) {
  const vehicle = [sale.year, sale.make, sale.model_name].filter(Boolean).join(' ');

  return (
    <aside className={cardClassName}>
      <div className="mb-ml flex items-center justify-between gap-s">
        <strong className="text-lead">{vehicle || 'Your vehicle'}</strong>
        <StatusPill status={sale.status} />
      </div>
      <dl className="m-0 grid gap-ml">
        <DetailItem term="Reference">{sale.reference}</DetailItem>
        <DetailItem term="Price">{formatMoney(sale.vehicle_price ?? '')}</DetailItem>
        {Number(sale.delivery_fee) > 0 && (
          <DetailItem term="Delivery">{formatMoney(sale.delivery_fee)}</DetailItem>
        )}
        <DetailItem term="Balance to pay">{formatMoney(sale.balance_amount ?? '')}</DetailItem>
        <DetailItem term="Your dealer">
          {sale.dealer_name}
          <br />
          <a href={`mailto:${sale.dealer_email}`}>{sale.dealer_email}</a>
          {sale.dealer_phone && (
            <>
              <br />
              {sale.dealer_phone}
            </>
          )}
        </DetailItem>
      </dl>

      {sale.signed_at && !sale.accepted_at && (
        <p className="mt-ml mb-0 text-label leading-[1.6] text-text-muted">
          <strong>You have made an offer, not a purchase.</strong> {sale.dealer_name} has to accept
          and sign it before there is a contract, and we will email you the moment they do.
        </p>
      )}
    </aside>
  );
}
