export interface Plan<Code extends string> {
  code: Code;
  name: string;
  price: string;
  cadence: string;
  summary: string;
  features: string[];
  recommended?: boolean;
}

export function planByCode<P extends Plan<string>>(plans: P[], code: string): P | undefined {
  return plans.find((plan) => plan.code === code);
}
