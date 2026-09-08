import type { Metadata } from "next";

import { SeoPaymentPage } from "./SeoPaymentPage";

export const metadata: Metadata = {
  title: "Secure SEO Checkout",
  robots: { index: false, follow: false },
};

export default function PaymentPage() {
  return <SeoPaymentPage />;
}
