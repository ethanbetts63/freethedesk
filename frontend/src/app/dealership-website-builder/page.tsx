import type { Metadata } from "next";

import { PageSchema } from "@/components/PageSchema";
import { pageMetadata } from "@/lib/seo";

import { WebsiteConfigurator } from "./_components/WebsiteConfigurator";

const TITLE = "Build Your Dealership Website";
const DESCRIPTION = "Configure a dealership website around the way your business sells, books and grows.";
const PATH = "/dealership-website-builder";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function WebsiteBuilderPage() {
  return (
    <>
      <PageSchema title={TITLE} description={DESCRIPTION} path={PATH} />
      <WebsiteConfigurator />
    </>
  );
}
