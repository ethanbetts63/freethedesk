import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { PageSchema } from "@/components/PageSchema";
import { pageMetadata } from "@/lib/seo";

const TITLE = "Privacy Policy";
const DESCRIPTION = "How Free the Desk collects, uses, stores and discloses personal information.";
const PATH = "/legal/privacy";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageSchema title={TITLE} description={DESCRIPTION} path={PATH} />
      <LegalDocument filename="privacy-policy.md" />
    </>
  );
}
