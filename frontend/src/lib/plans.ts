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
