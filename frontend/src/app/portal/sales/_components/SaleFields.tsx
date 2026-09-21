'use client';

import type { UseFormReturn } from 'react-hook-form';

import {
  PortalCheckbox,
  PortalField,
  PortalFieldset,
  PortalSelect,
  portalFieldGridClassName,
} from '@/components/dashboard/PortalField';
import {
  CONDITIONS,
  FULFILMENTS,
  VEHICLE_CLASSES,
  type NewSalePayload,
  type NewSaleValues,
} from '../new/NewSale.schema';

/**
 * The sale's own fields, shared by the create screen and the edit block on the
 * sale page.
 *
 * They are one component because they are one set of rules. The conditional
 * groups below — a new vehicle has no odometer, an electric one has no capacity,
 * a collection has no address — are the reason the form is Track A, and having
 * them written twice would mean a rule changed on the create screen and not on
 * the edit one, which is the failure that produces a wrong document.
 */
export type SaleForm = UseFormReturn<NewSaleValues, unknown, NewSalePayload>;

export function SaleFields({ form, disabled }: { form: SaleForm; disabled: boolean }) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  // The answers the rest of the form is conditional on, which is the visible
  // reason class and condition are the first two controls on the page.
  const isNewStock = watch('condition') === 'new';
  const isElectric = watch('is_electric');
  const isDelivery = watch('fulfilment_method') === 'delivery';

  return (
    <>
      <PortalFieldset
        disabled={disabled}
        legend="Vehicle"
        description="What the prescribed forms and the warranty test read. Class and condition come first because they decide which of the fields below apply."
      >
        <div className={portalFieldGridClassName}>
          <PortalSelect
            label="Class"
            options={VEHICLE_CLASSES}
            error={errors.vehicle_class?.message}
            {...register('vehicle_class')}
          />
          <PortalSelect
            label="Condition"
            options={CONDITIONS}
            error={errors.condition?.message}
            {...register('condition')}
          />
          <PortalField label="Make" error={errors.make?.message} {...register('make')} />
          <PortalField
            label="Model"
            error={errors.model_name?.message}
            {...register('model_name')}
          />
          <PortalField
            label="Year"
            type="number"
            hint="Read by the statutory warranty test."
            error={errors.year?.message}
            {...register('year')}
          />
          <PortalField
            label="Body type"
            error={errors.body_type?.message}
            {...register('body_type')}
          />
          <PortalField label="Colour" error={errors.colour?.message} {...register('colour')} />
          <PortalField
            label="VIN"
            hint="Leave blank if the vehicle has not arrived yet."
            error={errors.vin?.message}
            {...register('vin')}
          />
          <PortalField
            label="Engine number"
            error={errors.engine_number?.message}
            {...register('engine_number')}
          />
          {!isElectric && (
            <PortalField
              label="Engine capacity (cc)"
              type="number"
              error={errors.engine_capacity_cc?.message}
              {...register('engine_capacity_cc')}
            />
          )}
          <PortalField
            label="Stock number"
            error={errors.stock_number?.message}
            {...register('stock_number')}
          />
          <PortalField
            label="Registration"
            hint={isNewStock ? 'Leave blank — this vehicle is not licensed yet.' : undefined}
            error={errors.registration?.message}
            {...register('registration')}
          />
          {isNewStock ? (
            <PortalField
              label="Registration included (months)"
              type="number"
              hint="A new vehicle has no expiry to state, only a term that starts when it is licensed."
              error={errors.registration_months_included?.message}
              {...register('registration_months_included')}
            />
          ) : (
            <>
              <PortalField
                label="Registration expiry"
                type="date"
                error={errors.registration_expiry?.message}
                {...register('registration_expiry')}
              />
              <PortalField
                label="Odometer (km)"
                type="number"
                hint="Read by the statutory warranty test."
                error={errors.odometer_km?.message}
                {...register('odometer_km')}
              />
            </>
          )}
          <PortalField
            label="RRP"
            type="number"
            step="0.01"
            hint="The dutiable value on the licensing form, where it differs from the price."
            error={errors.rrp?.message}
            {...register('rrp')}
          />
        </div>
        <div className="mt-ml">
          <PortalCheckbox
            label="Electric"
            hint="An electric vehicle has no engine capacity to state."
            error={errors.is_electric?.message}
            {...register('is_electric')}
          />
        </div>
      </PortalFieldset>

      <PortalFieldset
        disabled={disabled}
        legend="Money"
        description="The balance the customer is asked to transfer is worked out from these three."
      >
        <div className={portalFieldGridClassName}>
          <PortalField
            label="Vehicle price"
            type="number"
            step="0.01"
            hint="Including GST."
            error={errors.vehicle_price?.message}
            {...register('vehicle_price')}
          />
          <PortalField
            label="Delivery fee"
            type="number"
            step="0.01"
            error={errors.delivery_fee?.message}
            {...register('delivery_fee')}
          />
          <PortalField
            label="Deposit already taken"
            type="number"
            step="0.01"
            error={errors.deposit_amount?.message}
            {...register('deposit_amount')}
          />
        </div>
      </PortalFieldset>

      <PortalFieldset
        disabled={disabled}
        legend="Customer"
        description="Only what addresses the link. Their licence details, identity and signature come from them."
      >
        <div className={portalFieldGridClassName}>
          <PortalField
            label="Name"
            error={errors.customer_name?.message}
            {...register('customer_name')}
          />
          <PortalField
            label="Email"
            type="email"
            hint="Where the sale link goes."
            error={errors.customer_email?.message}
            {...register('customer_email')}
          />
          <PortalField
            label="Phone"
            error={errors.customer_phone?.message}
            {...register('customer_phone')}
          />
          <PortalSelect
            label="Handover"
            options={FULFILMENTS}
            error={errors.fulfilment_method?.message}
            {...register('fulfilment_method')}
          />
          {isDelivery && (
            <>
              <PortalField
                label="Delivery address"
                error={errors.delivery_address_line1?.message}
                {...register('delivery_address_line1')}
              />
              <PortalField
                label="Suburb"
                error={errors.delivery_suburb?.message}
                {...register('delivery_suburb')}
              />
              <PortalField
                label="State"
                error={errors.delivery_state?.message}
                {...register('delivery_state')}
              />
              <PortalField
                label="Postcode"
                inputMode="numeric"
                error={errors.delivery_postcode?.message}
                {...register('delivery_postcode')}
              />
            </>
          )}
        </div>
      </PortalFieldset>
    </>
  );
}
