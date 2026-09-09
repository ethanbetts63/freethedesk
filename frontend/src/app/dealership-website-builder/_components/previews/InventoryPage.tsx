"use client";

import { useState } from "react";

import { ConversionButton } from "../ConversionButton";
import { VehicleArtwork } from "../PreviewArtwork";
import { INVENTORY_VEHICLES } from "./data";
import type { InventoryVehicle } from "./data";
import { CatalogueControls, InventoryTile, OnlinePurchaseSteps } from "./shared";
import type { InventoryAddonSelection } from "../../_lib/types";
import styles from "../../_styles/preview.module.css";

export function InventoryPage({
  inventoryAddons,
  onVehicleOpen,
}: {
  inventoryAddons: InventoryAddonSelection;
  onVehicleOpen: (vehicle: InventoryVehicle) => void;
}) {
  const [brand, setBrand] = useState("all");
  const [condition, setCondition] = useState("all");
  const showOnlineSteps = inventoryAddons.contract && inventoryAddons.licensing;
  const vehicles = INVENTORY_VEHICLES.filter((vehicle) => brand === "all" || vehicle.brand === brand).filter(
    (vehicle) => condition === "all" || vehicle.condition.toLowerCase() === condition,
  );

  const clearFilters = () => {
    setBrand("all");
    setCondition("all");
  };

  return (
    <div className={styles.inventoryPage}>
      <section className={styles.inventoryHero}>
        <div>
          <small>Ready when you are</small>
          <h2>Find your next machine.</h2>
          <p>
            Browse new and pre-owned vehicles, compare the details and take the next step online or in the dealership.
          </p>
          <button
            type="button"
            onClick={() => document.getElementById("demo-inventory")?.scrollIntoView({ behavior: "smooth" })}
          >
            Browse available stock ↓
          </button>
        </div>
        <div className={styles.inventoryHeroVisual}>
          <VehicleArtwork />
        </div>
      </section>
      {showOnlineSteps && <OnlinePurchaseSteps />}
      <div className={styles.inventoryContent} id="demo-inventory">
        {inventoryAddons.newsletter && (
          <form className={styles.stockNewsletter} onSubmit={(event) => event.preventDefault()}>
            <div>
              <small>New stock alerts</small>
              <strong>Be first to see what arrives.</strong>
              <span>Get an email when new stock is listed. Nothing else.</span>
            </div>
            <label>
              <input
                type="email"
                required
                aria-label="Email address for new stock alerts"
                placeholder="Your email address"
              />
              <ConversionButton type="submit">Sign up →</ConversionButton>
            </label>
          </form>
        )}
        <CatalogueControls
          selects={[
            {
              label: "Brand",
              value: brand,
              onChange: setBrand,
              options: [
                { label: "All brands", value: "all" },
                { label: "Horizon", value: "Horizon" },
                { label: "Axis", value: "Axis" },
                { label: "Northline", value: "Northline" },
              ],
            },
            {
              label: "Condition",
              value: condition,
              onChange: setCondition,
              options: [
                { label: "All stock", value: "all" },
                { label: "New", value: "new" },
                { label: "Used", value: "used" },
              ],
            },
          ]}
          onClear={clearFilters}
          resultCount={vehicles.length}
          resultName="vehicles"
        />
        {vehicles.length > 0 ? (
          <div className={styles.catalogueGrid}>
            {vehicles.map((vehicle) => (
              <InventoryTile
                key={vehicle.name}
                vehicle={vehicle}
                inventoryAddons={inventoryAddons}
                onOpen={() => onVehicleOpen(vehicle)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.noInventoryResults}>
            <strong>No vehicles match those filters.</strong>
            <button type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
