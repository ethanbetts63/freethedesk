import type { Metadata } from "next";

import { WebsiteConfigurator } from "./WebsiteConfigurator";

export const metadata: Metadata = {
  title: "Build Your Dealership Website",
  description: "Configure a dealership website around the way your business sells, books and grows.",
};

export default function WebsiteBuilderPage() {
  return <WebsiteConfigurator />;
}
