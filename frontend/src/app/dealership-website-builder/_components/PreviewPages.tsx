"use client";

import dynamic from "next/dynamic";

import type { InventoryAddonSelection, PreviewPage } from "../_lib/types";
import { InventoryPage } from "./previews/InventoryPage";
import { VehicleDetailsPage } from "./previews/VehicleDetailsPage";
import type { InventoryVehicle } from "./previews/data";

/* Inventory and the vehicle detail page are the path into the demo, so they
   ship with the configurator. The rest are only reachable by clicking through
   the simulated navigation, so they load on demand instead of sitting in the
   initial bundle. */
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

export function ExamplePage({
  page,
  inventoryAddons,
  brandName,
  selectedVehicle,
  onVehicleOpen,
  onPageChange,
}: ExamplePageProps) {
  if (page === "inventory") return <InventoryPage inventoryAddons={inventoryAddons} onVehicleOpen={onVehicleOpen} />;
  if (page === "vehicle")
    return (
      <VehicleDetailsPage
        vehicle={selectedVehicle}
        inventoryAddons={inventoryAddons}
        onBack={() => onPageChange("inventory")}
      />
    );
  if (page === "accessories") return <AccessoriesPage />;
  if (page === "parts") return <PartsPage />;
  if (page === "hire") return <HirePage />;
  if (page === "service") return <ServicePage />;
  if (page === "contact") return <ContactPage brandName={brandName} />;
  if (page === "terms") return <TermsPage />;
  return <ArticlesPage />;
}
