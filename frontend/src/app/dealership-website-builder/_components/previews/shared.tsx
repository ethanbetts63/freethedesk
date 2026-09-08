"use client";

/* Building blocks reused across the individual preview pages. */

import type { InventoryVehicle } from "./data";
import type { InventoryAddonSelection } from "../../_lib/types";
import styles from "../../page.module.css";

export function PageHeading({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return (
    <header className={styles.exampleHeading}>
      <div>
        <small>{eyebrow}</small>
        <h2>{title}</h2>
      </div>
      <span>{detail}</span>
    </header>
  );
}

export type CatalogueSelect = {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
};

export function CatalogueControls({
  selects,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onClear,
  resultCount,
  resultName,
}: {
  selects: CatalogueSelect[];
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onClear: () => void;
  resultCount: number;
  resultName: string;
}) {
  return (
    <>
      <form className={styles.inventoryFilters} onSubmit={(event) => event.preventDefault()}>
        {selects.map((select) => (
          <label key={select.label}>
            <span>{select.label}</span>
            <select value={select.value} onChange={(event) => select.onChange(event.target.value)}>
              {select.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
        <label>
          <span>Price</span>
          <div>
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => onMinPriceChange(event.target.value)}
              placeholder="Min"
            />
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(event.target.value)}
              placeholder="Max"
            />
          </div>
        </label>
        <button type="button" onClick={onClear}>
          Clear
        </button>
      </form>
      <div className={styles.inventoryResults}>
        <strong>
          {resultCount} {resultName}
        </strong>
        <span>Filters and sorting update instantly</span>
      </div>
    </>
  );
}

export function MiniVehicle() {
  return (
    <div className={styles.miniVehicle} aria-hidden="true">
      <span />
      <i />
      <i />
    </div>
  );
}

export function InventoryTile({
  vehicle,
  inventoryAddons,
  onOpen,
}: {
  vehicle: InventoryVehicle;
  inventoryAddons: InventoryAddonSelection;
  onOpen?: () => void;
}) {
  const hasOnlineActions = inventoryAddons.purchase || inventoryAddons.contract || inventoryAddons.licensing;

  return (
    <article
      className={styles.inventoryTile}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (onOpen && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <MiniVehicle />
      <small>{vehicle.condition === "New" ? "New arrival" : "Pre-owned"}</small>
      <strong>
        {vehicle.brand} {vehicle.name}
      </strong>
      <div className={styles.vehicleFacts}>
        <span>{vehicle.year}</span>
        <span>{vehicle.engine}cc</span>
        <span>{vehicle.transmission}</span>
      </div>
      <p>${vehicle.price.toLocaleString()}</p>
      <div className={styles.stockActions}>
        {inventoryAddons.purchase && <button type="button">Buy online</button>}
        {inventoryAddons.contract && <button type="button">Sales contract</button>}
        {inventoryAddons.licensing && <button type="button">License online</button>}
        {!hasOnlineActions && <button type="button">View vehicle</button>}
      </div>
    </article>
  );
}

export function OnlinePurchaseSteps() {
  return (
    <section className={styles.purchaseSteps} aria-label="Three steps to purchase online">
      <div>
        <b>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 5h18v14H3zM3 9h18M7 15h4" />
          </svg>
        </b>
        <span>
          <em>Step 1</em>
          <strong>Pick &amp; Pay</strong>
          <small>Buy it online. Pay in full, or reserve it with a deposit.</small>
        </span>
      </div>
      <div>
        <b>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 2.5h10l4 4v15H5zM15 2.5v5h4M8 12h7m-7 4h4" />
          </svg>
        </b>
        <span>
          <em>Step 2</em>
          <strong>Paperwork &amp; Payment</strong>
          <small>We sort the transfer. Pay the balance online.</small>
        </span>
      </div>
      <div>
        <b>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7zM6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          </svg>
        </b>
        <span>
          <em>Step 3</em>
          <strong>Delivered, or collect</strong>
          <small>To your door across Perth metro, or collect the motorcycle from the dealership.</small>
        </span>
      </div>
    </section>
  );
}
