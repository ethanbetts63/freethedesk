"use client";

import dynamic from "next/dynamic";

import type { InventoryAddonSelection, PreviewPage } from "../_lib/types";
import { InventoryPage } from "./previews/InventoryPage";
import { VehicleDetailsPage } from "./previews/VehicleDetailsPage";
import type { InventoryVehicle } from "./previews/data";

/* Only inventory and vehicle detail are on the initial path; the rest load on
   demand when the simulated nav reaches them. */
const AccessoriesPage = dynamic(() => import("./previews/AccessoriesPage").then((m) => m.AccessoriesPage));
const ArticlesPage = dynamic(() => import("./previews/ArticlesPage").then((m) => m.ArticlesPage));
const ContactPage = dynamic(() => import("./previews/ContactPage").then((m) => m.ContactPage));
const HirePage = dynamic(() => import("./previews/HirePage").then((m) => m.HirePage));
const PartsPage = dynamic(() => import("./previews/PartsPage").then((m) => m.PartsPage));
const ServicePage = dynamic(() => import("./previews/ServicePage").then((m) => m.ServicePage));
const TermsPage = dynamic(() => import("./previews/TermsPage").then((m) => m.TermsPage));

export { INVENTORY_VEHICLES } from "./previews/data";
export type { InventoryVehicle } from "./previews/data";
export { InventoryTile, MiniVehicle } from "./previews/shared";

type ExamplePageProps = {
  page: Exclude<PreviewPage, "home">;
  inventoryAddons: InventoryAddonSelection;
  brandName: string;
  selectedVehicle: InventoryVehicle;
  onVehicleOpen: (vehicle: InventoryVehicle) => void;
  onPageChange: (page: PreviewPage) => void;
};

const PREVIEW_RENDERERS: Record<Exclude<PreviewPage, "home">, (props: ExamplePageProps) => React.ReactNode> = {
  inventory: ({ inventoryAddons, onVehicleOpen }) => (
    <InventoryPage inventoryAddons={inventoryAddons} onVehicleOpen={onVehicleOpen} />
  ),
  vehicle: ({ selectedVehicle, inventoryAddons, onPageChange }) => (
    <VehicleDetailsPage
      vehicle={selectedVehicle}
      inventoryAddons={inventoryAddons}
      onBack={() => onPageChange("inventory")}
    />
  ),
  accessories: () => <AccessoriesPage />,
  parts: () => <PartsPage />,
  hire: () => <HirePage />,
  service: () => <ServicePage />,
  contact: ({ brandName }) => <ContactPage brandName={brandName} />,
  terms: () => <TermsPage />,
  articles: () => <ArticlesPage />,
};

export function ExamplePage({
  page,
  inventoryAddons,
  brandName,
  selectedVehicle,
  onVehicleOpen,
  onPageChange,
}: ExamplePageProps) {
  return PREVIEW_RENDERERS[page]({
    page,
    inventoryAddons,
    brandName,
    selectedVehicle,
    onVehicleOpen,
    onPageChange,
  });
}
