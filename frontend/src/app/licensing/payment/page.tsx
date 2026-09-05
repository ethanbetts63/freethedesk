import type { Metadata } from "next";

import { SubscriptionPaymentPage } from "./SubscriptionPaymentPage";

export const metadata: Metadata = {
  title: "Secure Subscription Checkout",
  robots: { index: false, follow: false },
};

export default function PaymentPage() {
  return <SubscriptionPaymentPage />;
}
