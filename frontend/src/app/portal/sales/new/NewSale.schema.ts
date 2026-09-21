import { z } from 'zod';

import { FIELD_MAX } from '@freetheplatform/web-security';

/**
 * The sale a dealer keys in the showroom.
 *
 * Track A under the forms standard, and it qualifies on cross-field validation
 * alone: almost every rule below spans two fields. A new vehicle has no
 * odometer reading and no registration expiry; a used one has no registration
 * term included in its price; an electric one has no engine capacity; a
 * collection has no delivery address. Written as inline rules those would be
 * four conditions scattered through the markup, each one easy to change on one
 * side and not the other.
 *
 * The same rules exist in `sales/serializers/dealer_sale.py`. That is the
 * enforcement; this is the part that tells somebody at the point of typing.
 */

const blankToUndefined = (value: unknown) => (value === '' || value === null ? undefined : value);

const optionalInt = z.preprocess(
  blankToUndefined,
  z.coerce.number().int().nonnegative().optional(),
);

const optionalMoney = z.preprocess(
  blankToUndefined,
  z.coerce.number().nonnegative('Amounts cannot be negative.').optional(),
);

const money = z.preprocess(
  blankToUndefined,
  z.coerce.number().nonnegative('Amounts cannot be negative.').default(0),
);

export const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'demo', label: 'Demonstrator' },
] as const;

export const VEHICLE_CLASSES = [
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'moped', label: 'Moped' },
] as const;

export const FULFILMENTS = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Collection' },
] as const;

export const newSaleSchema = z
  .object({
    vehicle_class: z.enum(['motorcycle', 'moped']),
    condition: z.enum(['new', 'used', 'demo']),
    make: z.string().max(120).min(1, 'Give the make.'),
    model_name: z.string().max(120).min(1, 'Give the model.'),
    // Not `min(1900)`: the oldest thing a dealer might sell is not ours to
    // guess, and the warranty engine reads this rather than a range check.
    year: optionalInt,
    body_type: z.string().max(60),
    colour: z.string().max(60),
    vin: z.string().max(17),
    engine_number: z.string().max(64),
    engine_capacity_cc: optionalInt,
    is_electric: z.boolean(),
    odometer_km: optionalInt,
    registration: z.string().max(20),
    registration_expiry: z.string().max(FIELD_MAX.token),
    registration_months_included: optionalInt,
    stock_number: z.string().max(64),
    rrp: optionalMoney,

    vehicle_price: optionalMoney,
    delivery_fee: money,
    deposit_amount: money,

    customer_name: z.string().max(FIELD_MAX.name).min(1, 'Give the customer a name.'),
    customer_email: z
      .string()
      .max(FIELD_MAX.email)
      .email('Enter the email address the sale link goes to.'),
    customer_phone: z.string().max(FIELD_MAX.phone),

    fulfilment_method: z.enum(['delivery', 'pickup']),
    delivery_address_line1: z.string().max(FIELD_MAX.line),
    delivery_suburb: z.string().max(120),
    delivery_state: z.string().max(3),
    delivery_postcode: z.string().max(FIELD_MAX.postcode),
  })
  .superRefine((values, ctx) => {
    const refuse = (path: keyof typeof values, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message });

    if (values.condition === 'new') {
      if (values.odometer_km) {
        refuse('odometer_km', 'New stock has no odometer reading to state.');
      }
      if (values.registration_expiry) {
        refuse(
          'registration_expiry',
          'New stock is not licensed yet. Give the registration term included in the price instead.',
        );
      }
    } else if (values.registration_months_included) {
      refuse(
        'registration_months_included',
        'Used stock carries the registration already on it. Give its expiry date instead.',
      );
    }

    if (values.is_electric && values.engine_capacity_cc) {
      refuse('engine_capacity_cc', 'An electric vehicle has no engine capacity.');
    }

    if (values.fulfilment_method === 'delivery') {
      if (!values.delivery_address_line1) {
        refuse('delivery_address_line1', 'Where is it being delivered?');
      }
      if (!values.delivery_suburb) refuse('delivery_suburb', 'Give the suburb.');
      if (!values.delivery_postcode) refuse('delivery_postcode', 'Give the postcode.');
    } else {
      // Not merely unnecessary — the API refuses it, because an address on a
      // collection prints onto a special condition about delivery.
      if (values.delivery_address_line1) {
        refuse('delivery_address_line1', 'This sale is a collection, not a delivery.');
      }
    }

    if (values.delivery_postcode && !/^\d{4}$/.test(values.delivery_postcode)) {
      refuse('delivery_postcode', 'An Australian postcode is four digits.');
    }
  });

export type NewSaleValues = z.input<typeof newSaleSchema>;
export type NewSalePayload = z.output<typeof newSaleSchema>;

export const NEW_SALE_DEFAULTS: NewSaleValues = {
  vehicle_class: 'motorcycle',
  condition: 'used',
  make: '',
  model_name: '',
  year: '',
  body_type: '',
  colour: '',
  vin: '',
  engine_number: '',
  engine_capacity_cc: '',
  is_electric: false,
  odometer_km: '',
  registration: '',
  registration_expiry: '',
  registration_months_included: '',
  stock_number: '',
  rrp: '',
  vehicle_price: '',
  delivery_fee: '0',
  deposit_amount: '0',
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  fulfilment_method: 'delivery',
  delivery_address_line1: '',
  delivery_suburb: '',
  delivery_state: 'WA',
  delivery_postcode: '',
};
