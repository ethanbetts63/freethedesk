import { FIELD_MAX } from '@freetheplatform/web-security';
import { z } from 'zod';

/**
 * What the customer supplies: the details their documents print.
 *
 * Track A under the forms standard. Three conditional field groups — the
 * purchaser when they are not the licence holder, the company when there is
 * one, the delivery address when the dealer set the sale to delivery — is
 * exactly the cross-field case the track exists for.
 *
 * The same rules exist in `sales/serializers/customer_sale.py`. That is the
 * enforcement; this is the part that tells somebody at the point of typing.
 */

const line = z.string().trim().max(FIELD_MAX.line);
const name = z.string().trim().max(FIELD_MAX.name);
const suburb = z.string().trim().max(120);
const postcode = z
  .string()
  .trim()
  .max(FIELD_MAX.postcode)
  .refine(
    (value) => value === '' || /^\d{4}$/.test(value),
    'An Australian postcode is four digits.',
  );

export const saleFillSchema = z
  .object({
    licence_family_name: name.min(1, 'Give the family name on the licence.'),
    licence_given_names: name.min(1, 'Give the given names on the licence.'),
    licence_number: z.string().trim().max(64).min(1, 'Give the driver’s licence number.'),
    licence_date_of_birth: z.string().min(1, 'Give the date of birth on the licence.'),
    licensee_address_line1: line.min(1, 'Give the licence holder’s street address.'),
    licensee_suburb: suburb.min(1, 'Give the suburb.'),
    licensee_postcode: postcode,
    kept_primarily_in_wa: z.boolean(),

    purchaser_is_licence_holder: z.boolean(),
    purchaser_family_name: name,
    purchaser_given_names: name,
    purchaser_address_line1: line,
    purchaser_suburb: suburb,
    purchaser_postcode: postcode,

    licensed_to_company: z.boolean(),
    company_name: z.string().trim().max(FIELD_MAX.business_name),
    company_acn: z.string().trim().max(11),
    company_organisation_code: z.string().trim().max(64),

    delivery_address_line1: line,
    delivery_suburb: suburb,
    delivery_postcode: postcode,

    customer_phone: z.string().trim().max(FIELD_MAX.phone),
  })
  .superRefine((values, ctx) => {
    const require = (path: keyof typeof values, message: string) => {
      if (!values[path]) ctx.addIssue({ code: 'custom', path: [path], message });
    };

    if (!values.purchaser_is_licence_holder) {
      require('purchaser_family_name', 'Give your family name.');
      require('purchaser_given_names', 'Give your given names.');
      require('purchaser_address_line1', 'Give your street address.');
      require('purchaser_suburb', 'Give your suburb.');
      require('purchaser_postcode', 'Give your postcode.');
    }
    if (values.licensed_to_company) {
      // Half a company is worse than none: a form with a name and no ACN
      // produces an application the Department rejects, and the customer finds
      // out from the dealer weeks later.
      require('company_name', 'Give the company’s name.');
      require('company_acn', 'Give the company’s ACN.');
    }
  });

export type SaleFillValues = z.infer<typeof saleFillSchema>;

/**
 * The delivery group is required only when the dealer set the sale to delivery,
 * and the form does not know that from its own values — it is a fact about the
 * sale. Checked by the caller, which does.
 */
export function deliveryIssues(
  values: SaleFillValues,
): Partial<Record<keyof SaleFillValues, string>> {
  const issues: Partial<Record<keyof SaleFillValues, string>> = {};
  if (!values.delivery_address_line1) issues.delivery_address_line1 = 'Give the delivery address.';
  if (!values.delivery_suburb) issues.delivery_suburb = 'Give the suburb.';
  if (!values.delivery_postcode) issues.delivery_postcode = 'Give the postcode.';
  return issues;
}
