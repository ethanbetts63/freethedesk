"use client";

import { useState } from "react";

import { ConversionButton } from "../ConversionButton";
import { CatalogueControls, PageHeading } from "./shared";
import styles from "../../page.module.css";

export function AccessoriesPage() {
  const [addedProducts, setAddedProducts] = useState<string[]>([]);
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState("featured");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
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
    .filter((product) => availability === "all" || product.available)
    .filter((product) => !minPrice || product.price >= Number(minPrice))
    .filter((product) => !maxPrice || product.price <= Number(maxPrice))
    .sort((a, b) =>
      sort === "price-asc"
        ? a.price - b.price
        : sort === "price-desc"
          ? b.price - a.price
          : products.indexOf(a) - products.indexOf(b),
    );
  const clearFilters = () => {
    setCategory("all");
    setAvailability("all");
    setSort("featured");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className={styles.examplePage}>
      <PageHeading eyebrow="Parts and accessories" title="Make it your own." detail="Shop all →" />
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
          {
            label: "Sort by",
            value: sort,
            onChange: setSort,
            options: [
              { label: "Featured", value: "featured" },
              { label: "Price: low to high", value: "price-asc" },
              { label: "Price: high to low", value: "price-desc" },
            ],
          },
        ]}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        onClear={clearFilters}
        resultCount={visibleProducts.length}
        resultName="products"
      />
      <div className={`${styles.catalogueGrid} ${styles.accessoryGrid}`}>
        {visibleProducts.map((product) => {
          const originalIndex = products.findIndex((item) => item.name === product.name);
          return (
            <article key={product.name}>
              <div className={styles.accessoryVisual}>
                <i className={styles[`accessoryShape${originalIndex + 1}`]} />
              </div>
              <small>
                {addedProducts.includes(product.name)
                  ? "Added to your selection"
                  : product.available
                    ? "In stock"
                    : "Order item"}
              </small>
              <strong>{product.name}</strong>
              <p>${product.price}</p>
              <ConversionButton
                onClick={() =>
                  setAddedProducts((current) => (current.includes(product.name) ? current : [...current, product.name]))
                }
              >
                Add +
              </ConversionButton>
            </article>
          );
        })}
      </div>
      {visibleProducts.length === 0 && (
        <div className={styles.noInventoryResults}>
          <strong>No accessories match those filters.</strong>
          <button type="button" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
