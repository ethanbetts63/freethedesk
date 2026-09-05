import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Free the Desk collects, uses, stores and discloses personal information.",
};

export default function PrivacyPolicyPage() {
  return <LegalDocument filename="privacy-policy.md" />;
}
