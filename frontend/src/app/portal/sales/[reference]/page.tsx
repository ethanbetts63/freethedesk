'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { backClassName, pageClassName } from '@/components/ui/layout';
import {
  DetailItem,
  cardClassName,
  cardTitleClassName,
  cardWideClassName,
  detailGridClassName,
  detailListClassName,
} from '@/components/ui/Card';
import { cn } from '@/lib/utils';

import { getSale, type Sale } from '@/lib/dealerApi';
import { SaleDetailsForm } from './SaleDetailsForm';
import { SaleDocuments } from './SaleDocuments';
import { SaleIdentity } from './SaleIdentity';
import { formatDateTime, formatMoney } from '@/lib/formatting';

/** A field nobody has filled in yet reads as a gap, not as an empty string. */
function orDash(value: string | number | null | undefined) {
  return value === null || value === undefined || value === '' ? '—' : String(value);
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={cardClassName}>
      <h2 className={cardTitleClassName}>{title}</h2>
      <dl className={detailListClassName}>{children}</dl>
    </section>
  );
}

export default function SaleDetailPage() {
  const reference = useParams<{ reference: string }>().reference;
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getSale(reference)
      .then((result) => {
        if (active) setSale(result);
      })
      .catch((reason) => {
        if (active)
          setError(reason instanceof Error ? reason.message : 'This sale could not be loaded.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reference]);

  if (loading && !sale)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading sale…</p>
      </div>
    );
  if (!sale)
    return (
      <div className={pageClassName}>
        <Link className={backClassName} href="/portal/sales">
          ← Sales
        </Link>
        <Notice tone="danger">{error || 'This sale could not be found.'}</Notice>
      </div>
    );

  const isDelivery = sale.fulfilment_method === 'delivery';

  return (
    <div className={pageClassName}>
      <Link className={backClassName} href="/portal/sales">
        ← Sales
      </Link>
      <PageHeader
        align="center"
        kicker={sale.reference}
        title={sale.customer_name || 'Unnamed customer'}
        subtitle={`${sale.vehicle} · ${sale.produces_label} · started ${formatDateTime(sale.created_at)}`}
      >
        <StatusPill status={sale.status} />
      </PageHeader>

      {error && <Notice tone="danger">{error}</Notice>}

      <Notice tone={sale.waiting_on === 'dealer' ? 'warning' : 'success'}>
        {sale.waiting_on === 'dealer' ? 'Waiting on you: ' : 'Waiting on the customer: '}
        <strong>{sale.waiting_for}</strong>
      </Notice>

      <div className={detailGridClassName}>
        <DetailCard title="Vehicle">
          <DetailItem term="Class">{sale.vehicle_class}</DetailItem>
          <DetailItem term="Condition">{sale.condition}</DetailItem>
          <DetailItem term="Make and model">
            {orDash(`${sale.make} ${sale.model_name}`.trim())}
          </DetailItem>
          <DetailItem term="Year">{orDash(sale.year)}</DetailItem>
          <DetailItem term="Colour">{orDash(sale.colour)}</DetailItem>
          <DetailItem term="VIN">{orDash(sale.vin)}</DetailItem>
          <DetailItem term="Engine number">{orDash(sale.engine_number)}</DetailItem>
          <DetailItem term="Engine capacity">
            {sale.is_electric ? 'Electric' : orDash(sale.engine_capacity_cc)}
          </DetailItem>
          <DetailItem term="Odometer">
            {sale.odometer_km === null ? '—' : `${sale.odometer_km.toLocaleString('en-AU')} km`}
          </DetailItem>
          <DetailItem term="Registration">{orDash(sale.registration)}</DetailItem>
          <DetailItem term="Registration expiry">
            {sale.condition === 'new'
              ? `${orDash(sale.registration_months_included)} months from licensing`
              : orDash(sale.registration_expiry)}
          </DetailItem>
          <DetailItem term="Stock number">{orDash(sale.stock_number)}</DetailItem>
        </DetailCard>

        <DetailCard title="Money">
          <DetailItem term="Vehicle price">{formatMoney(sale.vehicle_price ?? '')}</DetailItem>
          <DetailItem term="Delivery fee">{formatMoney(sale.delivery_fee)}</DetailItem>
          <DetailItem term="Total including GST">{formatMoney(sale.total_amount ?? '')}</DetailItem>
          <DetailItem term="Deposit taken">{formatMoney(sale.deposit_amount)}</DetailItem>
          <DetailItem term="Balance payable">{formatMoney(sale.balance_amount ?? '')}</DetailItem>
          <DetailItem term="RRP">{formatMoney(sale.rrp ?? '')}</DetailItem>
        </DetailCard>

        <DetailCard title="Customer">
          <DetailItem term="Name">{orDash(sale.customer_name)}</DetailItem>
          <DetailItem term="Email">{orDash(sale.customer_email)}</DetailItem>
          <DetailItem term="Phone">{orDash(sale.customer_phone)}</DetailItem>
          <DetailItem term="Handover">
            {isDelivery ? 'Delivery' : 'Collection from your premises'}
          </DetailItem>
          {isDelivery && (
            <DetailItem term="Delivery address">
              {orDash(
                [
                  sale.delivery_address_line1,
                  sale.delivery_suburb,
                  sale.delivery_state,
                  sale.delivery_postcode,
                ]
                  .filter(Boolean)
                  .join(', '),
              )}
            </DetailItem>
          )}
        </DetailCard>

        <DetailCard title="Licence holder">
          <DetailItem term="Name">
            {orDash(`${sale.licence_given_names} ${sale.licence_family_name}`.trim())}
          </DetailItem>
          <DetailItem term="Licence number">{orDash(sale.licence_number)}</DetailItem>
          <DetailItem term="Date of birth">{orDash(sale.licence_date_of_birth)}</DetailItem>
          <DetailItem term="Address">
            {orDash(
              [sale.licensee_address_line1, sale.licensee_suburb, sale.licensee_postcode]
                .filter(Boolean)
                .join(', '),
            )}
          </DetailItem>
          <DetailItem term="Kept primarily in WA">
            {sale.kept_primarily_in_wa ? 'Yes' : 'No'}
          </DetailItem>
          <DetailItem term="Purchaser">
            {sale.purchaser_is_licence_holder
              ? 'The licence holder'
              : orDash(`${sale.purchaser_given_names} ${sale.purchaser_family_name}`.trim())}
          </DetailItem>
          {sale.licensed_to_company && (
            <DetailItem term="Company">
              {orDash(sale.company_name)} · ACN {orDash(sale.company_acn)}
            </DetailItem>
          )}
        </DetailCard>

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Identity</h2>
          <SaleIdentity sale={sale} onReviewed={setSale} />
        </section>

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Documents</h2>
          <SaleDocuments sale={sale} />
        </section>

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Edit details</h2>
          <SaleDetailsForm sale={sale} onSaved={setSale} />
        </section>
      </div>
    </div>
  );
}
