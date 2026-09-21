'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import {
  portalFormActionsClassName,
  portalFormClassName,
} from '@/components/dashboard/PortalField';
import { updateSale, type Sale } from '@/lib/dealerApi';
import { SaleFields } from '../_components/SaleFields';
import { newSaleSchema, type NewSalePayload, type NewSaleValues } from '../new/NewSale.schema';

/** The API sends numbers and money as `null` or a decimal string; the inputs
 * want strings, and an empty one is how "not stated" is typed. */
function asText(value: string | number | null): string {
  return value === null ? '' : String(value);
}

function valuesFrom(sale: Sale): NewSaleValues {
  return {
    vehicle_class: sale.vehicle_class,
    condition: sale.condition,
    make: sale.make,
    model_name: sale.model_name,
    year: asText(sale.year),
    body_type: sale.body_type,
    colour: sale.colour,
    vin: sale.vin,
    engine_number: sale.engine_number,
    engine_capacity_cc: asText(sale.engine_capacity_cc),
    is_electric: sale.is_electric,
    odometer_km: asText(sale.odometer_km),
    registration: sale.registration,
    registration_expiry: sale.registration_expiry ?? '',
    registration_months_included: asText(sale.registration_months_included),
    stock_number: sale.stock_number,
    rrp: asText(sale.rrp),
    vehicle_price: asText(sale.vehicle_price),
    delivery_fee: sale.delivery_fee,
    deposit_amount: sale.deposit_amount,
    customer_name: sale.customer_name,
    customer_email: sale.customer_email,
    customer_phone: sale.customer_phone,
    fulfilment_method: sale.fulfilment_method,
    delivery_address_line1: sale.delivery_address_line1,
    delivery_suburb: sale.delivery_suburb,
    delivery_state: sale.delivery_state,
    delivery_postcode: sale.delivery_postcode,
  };
}

/**
 * Editing a sale after it has been sent.
 *
 * The warning is not decoration. These fields print onto the documents the
 * customer signs, so changing one after a signature makes the signed copy
 * stale and sends them back to sign again. That is the correct outcome — the
 * alternative is a wrong name at a Department counter — and it should not
 * arrive as a surprise.
 */
export function SaleDetailsForm({ sale, onSaved }: { sale: Sale; onSaved: (sale: Sale) => void }) {
  const [failure, setFailure] = useState('');
  const [saved, setSaved] = useState(false);
  const form = useForm<NewSaleValues, unknown, NewSalePayload>({
    resolver: zodResolver(newSaleSchema),
    defaultValues: valuesFrom(sale),
  });
  const saving = form.formState.isSubmitting;

  async function save(values: NewSalePayload) {
    setFailure('');
    setSaved(false);
    try {
      onSaved(await updateSale(sale.reference, values));
      setSaved(true);
    } catch (reason) {
      setFailure(reason instanceof Error ? reason.message : 'The sale could not be saved.');
    }
  }

  return (
    <>
      {sale.signed_at && (
        <Notice tone="warning">
          This customer has already signed. Changing anything here makes their signed paperwork
          stale and sends them back to sign it again.
        </Notice>
      )}
      {failure && <Notice tone="danger">{failure}</Notice>}
      {saved && <Notice tone="success">Saved.</Notice>}

      <form className={portalFormClassName} onSubmit={form.handleSubmit(save)} noValidate>
        <SaleFields form={form} disabled={saving} />
        <div className={portalFormActionsClassName}>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </>
  );
}
