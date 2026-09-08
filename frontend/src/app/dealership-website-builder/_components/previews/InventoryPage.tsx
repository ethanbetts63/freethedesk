"use client";

import { useState } from "react";

import { ConversionButton } from "../ConversionButton";
import { INVENTORY_VEHICLES } from "./data";
import type { InventoryVehicle } from "./data";
import { CatalogueControls, InventoryTile, OnlinePurchaseSteps } from "./shared";
import type { InventoryAddonSelection } from "../../_lib/types";
import styles from "../../page.module.css";

export function InventoryPage({
  inventoryAddons,
  onVehicleOpen,
}: {
  inventoryAddons: InventoryAddonSelection;
  onVehicleOpen: (vehicle: InventoryVehicle) => void;
}) {
  const [brand, setBrand] = useState("all");
  const [condition, setCondition] = useState("all");
  const [sort, setSort] = useState("featured");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const showOnlineSteps = inventoryAddons.contract && inventoryAddons.licensing;
  const vehicles = INVENTORY_VEHICLES.filter((vehicle) => brand === "all" || vehicle.brand === brand)
    .filter((vehicle) => condition === "all" || vehicle.condition.toLowerCase() === condition)
    .filter((vehicle) => !minPrice || vehicle.price >= Number(minPrice))
    .filter((vehicle) => !maxPrice || vehicle.price <= Number(maxPrice))
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "year-desc") return b.year - a.year;
      if (sort === "year-asc") return a.year - b.year;
      if (sort === "engine-asc") return a.engine - b.engine;
      if (sort === "engine-desc") return b.engine - a.engine;
      return INVENTORY_VEHICLES.indexOf(a) - INVENTORY_VEHICLES.indexOf(b);
    });

  const clearFilters = () => {
    setBrand("all");
    setCondition("all");
    setSort("featured");
    setMinPrice("");
    setMaxPrice("");
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
        <div className={styles.inventoryHeroVisual} aria-hidden="true">
          <span />
          <i />
          <i />
        </div>
      </section>
      {showOnlineSteps && <OnlinePurchaseSteps />}
      <div className={styles.inventoryContent} id="demo-inventory">
        {inventoryAddons.newsletter && (
          <form
            className={styles.stockNewsletter}
            onSubmit={(event) => {
              event.preventDefault();
              if (newsletterEmail.trim()) setSubscribed(true);
            }}
          >
            <div>
              <small>New stock alerts</small>
              <strong>{subscribed ? "You're on the list." : "Be first to see what arrives."}</strong>
              <span>
                {subscribed
                  ? `Updates will be sent to ${newsletterEmail}.`
                  : "Get an email when new stock is listed. Nothing else."}
              </span>
            </div>
            {!subscribed && (
              <label>
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  required
                  aria-label="Email address for new stock alerts"
                  placeholder="Your email address"
                />
                <ConversionButton type="submit">Sign up →</ConversionButton>
              </label>
            )}
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
            {
              label: "Sort by",
              value: sort,
              onChange: setSort,
              options: [
                { label: "Featured", value: "featured" },
                { label: "Price: low to high", value: "price-asc" },
                { label: "Price: high to low", value: "price-desc" },
                { label: "Year: new to old", value: "year-desc" },
                { label: "Year: old to new", value: "year-asc" },
                { label: "Engine: low to high", value: "engine-asc" },
                { label: "Engine: high to low", value: "engine-desc" },
              ],
            },
          ]}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
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
