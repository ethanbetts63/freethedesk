'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { backClassName, pageClassName } from '@/components/ui/layout';
import {
  portalFormActionsClassName,
  portalFormClassName,
} from '@/components/dashboard/PortalField';
import { createSale } from '@/lib/dealerApi';
import { SaleFields } from '../_components/SaleFields';
import {
  NEW_SALE_DEFAULTS,
  newSaleSchema,
  type NewSalePayload,
  type NewSaleValues,
} from './NewSale.schema';

/**
 * One page, three sections, saved as one draft.
 *
 * Not a wizard. A dealer keying a sale they have just agreed in the showroom has
 * all of it in front of them, and three screens for twenty fields is slower for
 * everybody who is not learning the product.
 */
export default function NewSalePage() {
  const router = useRouter();
  const [failure, setFailure] = useState('');
  const form = useForm<NewSaleValues, unknown, NewSalePayload>({
    resolver: zodResolver(newSaleSchema),
    defaultValues: NEW_SALE_DEFAULTS,
  });
  const saving = form.formState.isSubmitting;

  async function save(values: NewSalePayload) {
    setFailure('');
    try {
      const sale = await createSale(values);
      router.push(`/portal/sales/${sale.reference}`);
    } catch (reason) {
      setFailure(reason instanceof Error ? reason.message : 'The sale could not be saved.');
    }
  }

  return (
    <div className={pageClassName}>
      <Link className={backClassName} href="/portal/sales">
        ← Sales
      </Link>
      <PageHeader
        kicker="Online licensing"
        title="New sale"
        subtitle="The vehicle, the money and who to send it to. The customer supplies the rest."
      />

      {failure && <Notice tone="danger">{failure}</Notice>}

      <form className={portalFormClassName} onSubmit={form.handleSubmit(save)} noValidate>
        <SaleFields form={form} disabled={saving} />
        <div className={portalFormActionsClassName}>
          <Button variant="secondary" href="/portal/sales">
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save draft'}
          </Button>
        </div>
      </form>
    </div>
  );
}
