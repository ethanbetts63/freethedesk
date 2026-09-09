"use client";

import { useState } from "react";

import { ConversionButton } from "../ConversionButton";
import { ProductArtwork } from "../PreviewArtwork";
import { CatalogueControls, CatalogueGrid, EmptyResults, PreviewPageShell } from "./shared";
import styles from "../../_styles/preview.module.css";

export function AccessoriesPage() {
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const products = [
    { name: "Touring luggage", price: 680, category: "touring", available: true },
    { name: "Protection bars", price: 420, category: "protection", available: true },
    { name: "Comfort seat", price: 360, category: "touring", available: false },
    { name: "Workshop cover", price: 145, category: "maintenance", available: true },
    { name: "Rider jacket", price: 290, category: "apparel", available: true },
    { name: "Care kit", price: 85, category: "maintenance", available: true },
  ];
  const visibleProducts = products
    .filter((product) => category === "all" || product.category === category)
    .filter((product) => availability === "all" || product.available);
  const clearFilters = () => {
    setCategory("all");
    setAvailability("all");
  };

  return (
    <PreviewPageShell
      kind="catalogue"
      heading={{ eyebrow: "Parts and accessories", title: "Make it your own.", detail: "Shop all →" }}
    >
      <CatalogueControls
        selects={[
          {
            label: "Category",
            value: category,
            onChange: setCategory,
            options: [
              { label: "All categories", value: "all" },
              { label: "Protection", value: "protection" },
              { label: "Touring", value: "touring" },
              { label: "Apparel", value: "apparel" },
              { label: "Maintenance", value: "maintenance" },
            ],
          },
          {
            label: "Availability",
            value: availability,
            onChange: setAvailability,
            options: [
              { label: "All products", value: "all" },
              { label: "In stock", value: "available" },
            ],
          },
        ]}
        onClear={clearFilters}
        resultCount={visibleProducts.length}
        resultName="products"
      />
      <CatalogueGrid className={styles.accessoryGrid}>
        {visibleProducts.map((product) => {
          const originalIndex = products.findIndex((item) => item.name === product.name);
          return (
            <article key={product.name}>
              <div className={styles.accessoryVisual}>
                <ProductArtwork variant={originalIndex + 1} />
              </div>
              <small>{product.available ? "In stock" : "Order item"}</small>
              <strong>{product.name}</strong>
              <p>${product.price}</p>
              <ConversionButton>Add +</ConversionButton>
            </article>
          );
        })}
      </CatalogueGrid>
      {visibleProducts.length === 0 && (
        <EmptyResults label="No accessories match those filters." onClear={clearFilters} />
      )}
    </PreviewPageShell>
  );
}
