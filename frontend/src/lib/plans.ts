/**
 * The shape every purchasable plan shares. Licensing and SEO each build their
 * own list of these from SiteSettings, but the card that renders them and the
 * lookup below are common to both.
 */
export interface Plan<Code extends string> {
  code: Code;
  name: string;
  price: string;
  cadence: string;
  summary: string;
  features: string[];
  recommended?: boolean;
}

export function planByCode<Code extends string>(plans: Plan<Code>[], code: string): Plan<Code> | undefined {
  return plans.find((plan) => plan.code === code);
}
