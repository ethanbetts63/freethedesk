'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import {
  PortalCheckbox,
  PortalField,
  PortalFieldset,
  portalFieldGridClassName,
  portalFormActionsClassName,
  portalFormClassName,
} from '@/components/dashboard/PortalField';
import { saveSaleDetails, type CustomerSale } from '@/lib/saleApi';
import { deliveryIssues, saleFillSchema, type SaleFillValues } from './SaleFill.schema';

function valuesFrom(sale: CustomerSale): SaleFillValues {
  return {
    licence_family_name: sale.licence_family_name,
    licence_given_names: sale.licence_given_names,
    licence_number: sale.licence_number,
    licence_date_of_birth: sale.licence_date_of_birth ?? '',
    licensee_address_line1: sale.licensee_address_line1,
    licensee_suburb: sale.licensee_suburb,
    licensee_postcode: sale.licensee_postcode,
    kept_primarily_in_wa: sale.kept_primarily_in_wa,
    purchaser_is_licence_holder: sale.purchaser_is_licence_holder,
    purchaser_family_name: sale.purchaser_family_name,
    purchaser_given_names: sale.purchaser_given_names,
    purchaser_address_line1: sale.purchaser_address_line1,
    purchaser_suburb: sale.purchaser_suburb,
    purchaser_postcode: sale.purchaser_postcode,
    licensed_to_company: sale.licensed_to_company,
    company_name: sale.company_name,
    company_acn: sale.company_acn,
    company_organisation_code: sale.company_organisation_code,
    delivery_address_line1: sale.delivery_address_line1,
    delivery_suburb: sale.delivery_suburb,
    delivery_postcode: sale.delivery_postcode,
    customer_phone: sale.customer_phone,
  };
}

/**
 * The Fill step: what the prescribed forms and the contract need, and nothing
 * else.
 *
 * Editable for as long as the customer still has something to do, not only on
 * the first pass. These details print onto the documents they are about to
 * sign, so noticing a misspelt name at the moment of signing is precisely when
 * it should be fixable — refusing would send the wrong name to the Department
 * of Transport rather than prevent it.
 */
export function SaleFill({
  sale,
  onSaved,
}: {
  sale: CustomerSale;
  onSaved: (sale: CustomerSale) => void;
}) {
  const [failure, setFailure] = useState('');
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SaleFillValues>({
    resolver: zodResolver(saleFillSchema),
    defaultValues: valuesFrom(sale),
  });

  const buyingForSomebodyElse = watch('purchaser_is_licence_holder') === false;
  const toCompany = watch('licensed_to_company');
  const isDelivery = sale.fulfilment_method === 'delivery';
  const locked = !sale.details_editable;

  async function save(values: SaleFillValues) {
    setFailure('');
    setSaved(false);

    if (isDelivery) {
      const issues = deliveryIssues(values);
      const fields = Object.entries(issues) as [keyof SaleFillValues, string][];
      if (fields.length) {
        for (const [field, message] of fields) setError(field, { message });
        return;
      }
    }

    try {
      onSaved(await saveSaleDetails(sale.reference, values));
      setSaved(true);
    } catch (reason) {
      setFailure(reason instanceof Error ? reason.message : 'Your details could not be saved.');
    }
  }

  if (locked)
    return (
      <Notice tone="success">
        Your part is done. If something here needs changing, contact {sale.dealer_name} — they can
        still amend it.
      </Notice>
    );

  return (
    <>
      {failure && <Notice tone="danger">{failure}</Notice>}
      {saved && <Notice tone="success">Saved.</Notice>}

      <form className={portalFormClassName} onSubmit={handleSubmit(save)} noValidate>
        <PortalFieldset
          disabled={isSubmitting}
          legend="The licence this vehicle goes on"
          description="Exactly as it appears on the driver’s licence. This is what we print on the application to the Department of Transport."
        >
          <div className={portalFieldGridClassName}>
            <PortalField
              label="Family name"
              error={errors.licence_family_name?.message}
              {...register('licence_family_name')}
            />
            <PortalField
              label="Given names"
              error={errors.licence_given_names?.message}
              {...register('licence_given_names')}
            />
            <PortalField
              label="Driver’s licence number"
              error={errors.licence_number?.message}
              {...register('licence_number')}
            />
            <PortalField
              label="Date of birth"
              type="date"
              error={errors.licence_date_of_birth?.message}
              {...register('licence_date_of_birth')}
            />
            <PortalField
              label="Street address"
              error={errors.licensee_address_line1?.message}
              {...register('licensee_address_line1')}
            />
            <PortalField
              label="Suburb"
              error={errors.licensee_suburb?.message}
              {...register('licensee_suburb')}
            />
            <PortalField
              label="Postcode"
              inputMode="numeric"
              error={errors.licensee_postcode?.message}
              {...register('licensee_postcode')}
            />
            <PortalField
              label="Contact phone"
              error={errors.customer_phone?.message}
              {...register('customer_phone')}
            />
          </div>
          <div className="mt-ml">
            <PortalCheckbox
              label="This vehicle will be kept mainly in Western Australia"
              {...register('kept_primarily_in_wa')}
            />
          </div>
        </PortalFieldset>

        <PortalFieldset disabled={isSubmitting} legend="Who is buying it">
          <PortalCheckbox
            label="I am buying this vehicle for myself"
            hint="Leave this unticked if you are buying it and someone else is being licensed for it. That is an ordinary sale — we just need both sets of details."
            {...register('purchaser_is_licence_holder')}
          />
          {buyingForSomebodyElse && (
            <div className={`${portalFieldGridClassName} mt-ml`}>
              <PortalField
                label="Your family name"
                error={errors.purchaser_family_name?.message}
                {...register('purchaser_family_name')}
              />
              <PortalField
                label="Your given names"
                error={errors.purchaser_given_names?.message}
                {...register('purchaser_given_names')}
              />
              <PortalField
                label="Your street address"
                error={errors.purchaser_address_line1?.message}
                {...register('purchaser_address_line1')}
              />
              <PortalField
                label="Your suburb"
                error={errors.purchaser_suburb?.message}
                {...register('purchaser_suburb')}
              />
              <PortalField
                label="Your postcode"
                inputMode="numeric"
                error={errors.purchaser_postcode?.message}
                {...register('purchaser_postcode')}
              />
            </div>
          )}
        </PortalFieldset>

        <PortalFieldset disabled={isSubmitting} legend="Licensing to a company">
          <PortalCheckbox
            label="This vehicle is being licensed to a company"
            {...register('licensed_to_company')}
          />
          {toCompany && (
            <div className={`${portalFieldGridClassName} mt-ml`}>
              <PortalField
                label="Company name"
                error={errors.company_name?.message}
                {...register('company_name')}
              />
              <PortalField
                label="ACN"
                error={errors.company_acn?.message}
                {...register('company_acn')}
              />
              <PortalField
                label="Organisation code"
                hint="If the company has one with the Department of Transport. Leave blank if not."
                error={errors.company_organisation_code?.message}
                {...register('company_organisation_code')}
              />
            </div>
          )}
        </PortalFieldset>

        {isDelivery && (
          <PortalFieldset
            disabled={isSubmitting}
            legend="Where it is being delivered"
            description="This is also where the Department sends your licensing papers."
          >
            <div className={portalFieldGridClassName}>
              <PortalField
                label="Street address"
                error={errors.delivery_address_line1?.message}
                {...register('delivery_address_line1')}
              />
              <PortalField
                label="Suburb"
                error={errors.delivery_suburb?.message}
                {...register('delivery_suburb')}
              />
              <PortalField
                label="Postcode"
                inputMode="numeric"
                error={errors.delivery_postcode?.message}
                {...register('delivery_postcode')}
              />
            </div>
          </PortalFieldset>
        )}

        <div className={portalFormActionsClassName}>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save my details'}
          </Button>
        </div>
      </form>
    </>
  );
}
