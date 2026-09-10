import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

import { PageSchema } from "@/components/PageSchema";
import { metadataFor } from "@/lib/pages";

import { WebsiteConfigurator } from "./_components/WebsiteConfigurator";

export const metadata: Metadata = metadataFor("/dealership-website-builder");

export default function WebsiteBuilderPage() {
  return (
    <>
      <PageSchema path="/dealership-website-builder" />

      <Breadcrumbs path="/dealership-website-builder" />
      <WebsiteConfigurator />
    </>
  );
}
