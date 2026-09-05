import type { Metadata } from "next";

import { PaymentComplete } from "./PaymentComplete";

export const metadata: Metadata = {
  title: "Confirming Subscription",
  robots: { index: false, follow: false },
};

export default function CompletePage() {
  return <PaymentComplete />;
}
