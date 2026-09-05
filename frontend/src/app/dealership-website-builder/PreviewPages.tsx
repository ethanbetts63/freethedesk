"use client";

import Image from "next/image";
import { useState } from "react";

import { ConversionButton, ConversionLink } from "./ConversionButton";
import { DemoMap } from "./DemoMap";
import styles from "./page.module.css";
import type { InventoryAddonSelection, PreviewPage } from "./types";

type ExamplePageProps = {
  page: Exclude<PreviewPage, "home">;
  inventoryAddons: InventoryAddonSelection;
  brandName: string;
  selectedVehicle: InventoryVehicle;
  onVehicleOpen: (vehicle: InventoryVehicle) => void;
  onPageChange: (page: PreviewPage) => void;
};

function PageHeading({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return <header className={styles.exampleHeading}><div><small>{eyebrow}</small><h2>{title}</h2></div><span>{detail}</span></header>;
}

type CatalogueSelect = { label: string; value: string; options: Array<{ label: string; value: string }>; onChange: (value: string) => void };

function CatalogueControls({ selects, minPrice, maxPrice, onMinPriceChange, onMaxPriceChange, onClear, resultCount, resultName }: { selects: CatalogueSelect[]; minPrice: string; maxPrice: string; onMinPriceChange: (value: string) => void; onMaxPriceChange: (value: string) => void; onClear: () => void; resultCount: number; resultName: string }) {
  return <><form className={styles.inventoryFilters} onSubmit={(event) => event.preventDefault()}>{selects.map((select) => <label key={select.label}><span>{select.label}</span><select value={select.value} onChange={(event) => select.onChange(event.target.value)}>{select.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>)}<label><span>Price</span><div><input type="number" min="0" value={minPrice} onChange={(event) => onMinPriceChange(event.target.value)} placeholder="Min" /><input type="number" min="0" value={maxPrice} onChange={(event) => onMaxPriceChange(event.target.value)} placeholder="Max" /></div></label><button type="button" onClick={onClear}>Clear</button></form><div className={styles.inventoryResults}><strong>{resultCount} {resultName}</strong><span>Filters and sorting update instantly</span></div></>;
}

export function MiniVehicle() {
  return <div className={styles.miniVehicle} aria-hidden="true"><span /><i /><i /></div>;
}

export type InventoryVehicle = { name: string; brand: string; condition: "New" | "Used"; price: number; year: number; engine: number; transmission: string; odometer: number };

export const INVENTORY_VEHICLES: InventoryVehicle[] = [
  { name: "Touring X", brand: "Horizon", condition: "New", price: 8990, year: 2026, engine: 650, transmission: "Manual", odometer: 0 },
  { name: "Urban 400", brand: "Axis", condition: "Used", price: 6240, year: 2023, engine: 400, transmission: "Automatic", odometer: 8400 },
  { name: "Adventure R", brand: "Northline", condition: "New", price: 13490, year: 2026, engine: 700, transmission: "Manual", odometer: 0 },
  { name: "Classic 250", brand: "Horizon", condition: "Used", price: 4990, year: 2021, engine: 250, transmission: "Automatic", odometer: 12150 },
  { name: "Cruiser S", brand: "Northline", condition: "Used", price: 9750, year: 2024, engine: 500, transmission: "Manual", odometer: 3950 },
  { name: "Trail Pro", brand: "Axis", condition: "New", price: 11290, year: 2025, engine: 550, transmission: "Manual", odometer: 0 },
];

export function InventoryTile({ vehicle, inventoryAddons, onOpen }: { vehicle: InventoryVehicle; inventoryAddons: InventoryAddonSelection; onOpen?: () => void }) {
  const hasOnlineActions = inventoryAddons.purchase || inventoryAddons.contract || inventoryAddons.licensing;

  return <article className={styles.inventoryTile} role={onOpen ? "button" : undefined} tabIndex={onOpen ? 0 : undefined} onClick={onOpen} onKeyDown={(event) => { if (onOpen && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onOpen(); } }}><MiniVehicle /><small>{vehicle.condition === "New" ? "New arrival" : "Pre-owned"}</small><strong>{vehicle.brand} {vehicle.name}</strong><div className={styles.vehicleFacts}><span>{vehicle.year}</span><span>{vehicle.engine}cc</span><span>{vehicle.transmission}</span></div><p>${vehicle.price.toLocaleString()}</p><div className={styles.stockActions}>{inventoryAddons.purchase && <button type="button">Buy online</button>}{inventoryAddons.contract && <button type="button">Sales contract</button>}{inventoryAddons.licensing && <button type="button">License online</button>}{!hasOnlineActions && <button type="button">View vehicle</button>}</div></article>;
}

function OnlinePurchaseSteps() {
  return <section className={styles.purchaseSteps} aria-label="Three steps to purchase online"><div><b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3zM3 9h18M7 15h4" /></svg></b><span><em>Step 1</em><strong>Pick &amp; Pay</strong><small>Buy it online. Pay in full, or reserve it with a deposit.</small></span></div><div><b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2.5h10l4 4v15H5zM15 2.5v5h4M8 12h7m-7 4h4" /></svg></b><span><em>Step 2</em><strong>Paperwork &amp; Payment</strong><small>We sort the transfer. Pay the balance online.</small></span></div><div><b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7zM6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /></svg></b><span><em>Step 3</em><strong>Delivered, or collect</strong><small>To your door across Perth metro, or collect the motorcycle from the dealership.</small></span></div></section>;
}

function InventoryPage({ inventoryAddons, onVehicleOpen }: { inventoryAddons: InventoryAddonSelection; onVehicleOpen: (vehicle: InventoryVehicle) => void }) {
  const [brand, setBrand] = useState("all");
  const [condition, setCondition] = useState("all");
  const [sort, setSort] = useState("featured");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const showOnlineSteps = inventoryAddons.contract && inventoryAddons.licensing;
  const vehicles = INVENTORY_VEHICLES
    .filter((vehicle) => brand === "all" || vehicle.brand === brand)
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

  const clearFilters = () => { setBrand("all"); setCondition("all"); setSort("featured"); setMinPrice(""); setMaxPrice(""); };

  return (
    <div className={styles.inventoryPage}>
      <section className={styles.inventoryHero}>
        <div><small>Ready when you are</small><h2>Find your next machine.</h2><p>Browse new and pre-owned vehicles, compare the details and take the next step online or in the dealership.</p><button onClick={() => document.getElementById("demo-inventory")?.scrollIntoView({ behavior: "smooth" })}>Browse available stock ↓</button></div>
        <div className={styles.inventoryHeroVisual} aria-hidden="true"><span /><i /><i /></div>
      </section>
      {showOnlineSteps && <OnlinePurchaseSteps />}
      <div className={styles.inventoryContent} id="demo-inventory">
        {inventoryAddons.newsletter && <form className={styles.stockNewsletter} onSubmit={(event) => { event.preventDefault(); if (newsletterEmail.trim()) setSubscribed(true); }}><div><small>New stock alerts</small><strong>{subscribed ? "You're on the list." : "Be first to see what arrives."}</strong><span>{subscribed ? `Updates will be sent to ${newsletterEmail}.` : "Get an email when new stock is listed. Nothing else."}</span></div>{!subscribed && <label><input type="email" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} required aria-label="Email address for new stock alerts" placeholder="Your email address" /><ConversionButton type="submit">Sign up →</ConversionButton></label>}</form>}
        <CatalogueControls selects={[{ label: "Brand", value: brand, onChange: setBrand, options: [{ label: "All brands", value: "all" }, { label: "Horizon", value: "Horizon" }, { label: "Axis", value: "Axis" }, { label: "Northline", value: "Northline" }] }, { label: "Condition", value: condition, onChange: setCondition, options: [{ label: "All stock", value: "all" }, { label: "New", value: "new" }, { label: "Used", value: "used" }] }, { label: "Sort by", value: sort, onChange: setSort, options: [{ label: "Featured", value: "featured" }, { label: "Price: low to high", value: "price-asc" }, { label: "Price: high to low", value: "price-desc" }, { label: "Year: new to old", value: "year-desc" }, { label: "Year: old to new", value: "year-asc" }, { label: "Engine: low to high", value: "engine-asc" }, { label: "Engine: high to low", value: "engine-desc" }] }]} minPrice={minPrice} maxPrice={maxPrice} onMinPriceChange={setMinPrice} onMaxPriceChange={setMaxPrice} onClear={clearFilters} resultCount={vehicles.length} resultName="vehicles" />
        {vehicles.length > 0 ? <div className={styles.catalogueGrid}>{vehicles.map((vehicle) => <InventoryTile key={vehicle.name} vehicle={vehicle} inventoryAddons={inventoryAddons} onOpen={() => onVehicleOpen(vehicle)} />)}</div> : <div className={styles.noInventoryResults}><strong>No vehicles match those filters.</strong><button onClick={clearFilters}>Clear filters</button></div>}
      </div>
    </div>
  );
}

function VehicleDetailsPage({ vehicle, inventoryAddons, onBack }: { vehicle: InventoryVehicle; inventoryAddons: InventoryAddonSelection; onBack: () => void }) {
  const [galleryImage, setGalleryImage] = useState(0);
  const [interestEmail, setInterestEmail] = useState("");
  const [interestSent, setInterestSent] = useState(false);
  const showOnlineSteps = inventoryAddons.contract && inventoryAddons.licensing;

  return (
    <div className={styles.vehicleDetailPage}>
      <button className={styles.backToInventory} onClick={onBack}>← Back to inventory</button>
      <section className={styles.vehicleGallery}>
        <div className={`${styles.vehicleGalleryMain} ${styles[`galleryTone${galleryImage + 1}`]}`}><div className={styles.detailVehicleVisual} aria-hidden="true"><span /><i /><i /></div><span>{vehicle.year} · {vehicle.brand}</span></div>
        <div className={styles.galleryThumbs}>{[0, 1, 2].map((image) => <button key={image} className={galleryImage === image ? styles.activeGalleryThumb : ""} onClick={() => setGalleryImage(image)} aria-label={`View vehicle image ${image + 1}`}><MiniVehicle /></button>)}</div>
      </section>
      <div className={styles.vehicleDetailLayout}>
        <main>
          <header className={styles.vehicleTitle}><div><small>{vehicle.condition} · Available now</small><h2>{vehicle.year} {vehicle.brand} {vehicle.name}</h2></div><span>Workshop inspected</span></header>
          <section className={styles.keyFacts}><h3>Key facts</h3><div><article><small>Condition</small><strong>{vehicle.condition}</strong><i>✓</i></article><article><small>{vehicle.condition === "Used" ? "Odometer" : "Engine"}</small><strong>{vehicle.condition === "Used" ? `${vehicle.odometer.toLocaleString()} km` : `${vehicle.engine}cc`}</strong><i>✓</i></article><article><small>Warranty</small><strong>{vehicle.condition === "New" ? "Manufacturer warranty" : "Details available"}</strong><i>✓</i></article><article><small>Available</small><strong>Available now</strong><i>✓</i></article></div></section>
          <section className={styles.vehicleSpecifications}><h3>Specifications</h3><dl><div><dt>Year</dt><dd>{vehicle.year}</dd></div><div><dt>Engine size</dt><dd>{vehicle.engine}cc</dd></div><div><dt>Transmission</dt><dd>{vehicle.transmission}</dd></div><div><dt>Condition</dt><dd>{vehicle.condition}</dd></div><div><dt>Fuel</dt><dd>Petrol</dd></div><div><dt>Colour</dt><dd>Midnight blue</dd></div></dl></section>
          <section className={styles.vehicleDescription}><h3>Description</h3><p>A beautifully prepared {vehicle.brand} {vehicle.name}, combining everyday usability with confident performance. Every detail has been checked by our workshop team and the vehicle is ready for its next owner.</p><p>Contact us to arrange a viewing, ask a question or complete the next steps online.</p></section>
        </main>
        <aside className={styles.vehicleBuyBox}>
          <small>Drive away</small><strong className={styles.detailPrice}>${vehicle.price.toLocaleString()}</strong>
          {inventoryAddons.purchase ? <section><div className={styles.reserveHeading}><strong>Reserve this vehicle</strong><span>Refundable deposit</span></div><p>Your $250 deposit secures the vehicle while we arrange the remaining steps.</p><ConversionButton className={styles.reserveButton}>Reserve now — $250</ConversionButton><ConversionButton className={styles.buyOutrightButton}>Or buy outright — ${vehicle.price.toLocaleString()}</ConversionButton></section> : <p className={styles.purchaseUnavailable}>Online purchasing can be added to let customers reserve or purchase directly from this page.</p>}
          {(inventoryAddons.contract || inventoryAddons.licensing) && <div className={styles.digitalFeatures}>{inventoryAddons.contract && <span>✓ Complete the sales contract online</span>}{inventoryAddons.licensing && <span>✓ Complete licensing paperwork online</span>}</div>}
          <div className={styles.enquiryDivider}><span>OR</span></div>
          <form className={styles.vehicleInterest} onSubmit={(event) => { event.preventDefault(); if (interestEmail.trim()) setInterestSent(true); }}><strong>Want to see it first, or have questions?</strong><p>{interestSent ? `Thanks — we'll contact you at ${interestEmail}.` : "Leave your email and we'll be in touch. No obligation."}</p><input type="email" required value={interestEmail} onChange={(event) => { setInterestEmail(event.target.value); setInterestSent(false); }} aria-label="Email address" placeholder="you@example.com" /><ConversionButton type="submit">Register interest</ConversionButton></form>
        </aside>
      </div>
      {showOnlineSteps && <div className={styles.detailPurchaseFlow}><h2>Ready to buy? Here&apos;s how it works.</h2><p>Reserve it online, complete the paperwork from home and choose delivery or collection.</p><OnlinePurchaseSteps /></div>}
    </div>
  );
}

function AccessoriesPage() {
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
    .sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : products.indexOf(a) - products.indexOf(b));
  const clearFilters = () => { setCategory("all"); setAvailability("all"); setSort("featured"); setMinPrice(""); setMaxPrice(""); };

  return (
    <div className={styles.examplePage}>
      <PageHeading eyebrow="Parts and accessories" title="Make it your own." detail="Shop all →" />
      <CatalogueControls selects={[{ label: "Category", value: category, onChange: setCategory, options: [{ label: "All categories", value: "all" }, { label: "Protection", value: "protection" }, { label: "Touring", value: "touring" }, { label: "Apparel", value: "apparel" }, { label: "Maintenance", value: "maintenance" }] }, { label: "Availability", value: availability, onChange: setAvailability, options: [{ label: "All products", value: "all" }, { label: "In stock", value: "available" }] }, { label: "Sort by", value: sort, onChange: setSort, options: [{ label: "Featured", value: "featured" }, { label: "Price: low to high", value: "price-asc" }, { label: "Price: high to low", value: "price-desc" }] }]} minPrice={minPrice} maxPrice={maxPrice} onMinPriceChange={setMinPrice} onMaxPriceChange={setMaxPrice} onClear={clearFilters} resultCount={visibleProducts.length} resultName="products" />
      <div className={`${styles.catalogueGrid} ${styles.accessoryGrid}`}>
        {visibleProducts.map((product) => { const originalIndex = products.findIndex((item) => item.name === product.name); return <article key={product.name}><div className={styles.accessoryVisual}><i className={styles[`accessoryShape${originalIndex + 1}`]} /></div><small>{addedProducts.includes(product.name) ? "Added to your selection" : product.available ? "In stock" : "Order item"}</small><strong>{product.name}</strong><p>${product.price}</p><ConversionButton onClick={() => setAddedProducts((current) => current.includes(product.name) ? current : [...current, product.name])}>Add +</ConversionButton></article>; })}
      </div>
      {visibleProducts.length === 0 && <div className={styles.noInventoryResults}><strong>No accessories match those filters.</strong><button onClick={clearFilters}>Clear filters</button></div>}
    </div>
  );
}

function PartsPage() {
  const [addedParts, setAddedParts] = useState<string[]>([]);
  const diagramParts = [
    { number: "01", name: "Cam shaft COMP", status: "Not available" },
    { number: "02", name: "Cam sprocket", status: "Not available" },
    { number: "03", name: "Cam chain", status: "Backorder", price: "$89.42" },
    { number: "04", name: "Cam chain tensioner", status: "In stock", price: "$30.00" },
    { number: "05", name: "Cam chain guide COMP", status: "Not available" },
    { number: "06", name: "O-ring 67X2.5", status: "Low stock", price: "$6.00" },
    { number: "07", name: "Flange bolt 8X16", status: "Not available" },
    { number: "08", name: "Flange bolt 6X20", status: "Not available" },
    { number: "09", name: "CYL. head L. side cover ASS'Y", status: "Not available" },
    { number: "10", name: "CYL. head L. side cover COMP.", status: "Not available" },
    { number: "11", name: "Breather tube", status: "Not available" },
  ];

  const addPart = (number: string) => setAddedParts((current) => current.includes(number) ? current : [...current, number]);

  return (
    <div className={styles.examplePage}>
      <PageHeading eyebrow="Genuine parts lookup" title="Cam shaft & cyl. head L. side cover" detail="CROX50 · 11 parts" />
      <div className={styles.partsSelectors}>
        <label><span>Year</span><select defaultValue="2015"><option>2015</option><option>2014</option></select></label>
        <label><span>Make</span><select defaultValue="SYM"><option>SYM</option></select></label>
        <label><span>Model</span><select defaultValue="CROX50"><option>CROX50</option><option>Orbit 50</option></select></label>
        <label><span>Diagram</span><select defaultValue="E03"><option>E03</option><option>E02</option><option>E04</option></select></label>
      </div>
      <div className={styles.partsWorkspace}>
        <figure className={styles.partsDiagram}>
          <figcaption><strong>E03</strong><span>Match the number in the diagram to the parts list.</span></figcaption>
          <Image className={styles.diagramImage} src="/images/parts-exploded-diagram.webp" alt="Cam shaft and cylinder head left side cover exploded diagram with 11 numbered callouts" width={617} height={382} />
        </figure>
        <aside className={styles.partsList}>
          <div className={styles.partsListHeader}><div><strong>Select your parts</strong><small>Numbers correspond to the diagram</small></div><span>{addedParts.length} added</span></div>
          <ol>
            {diagramParts.map((part) => {
              const isAdded = addedParts.includes(part.number);
              const isAvailable = Boolean(part.price);

              return <li key={part.number} className={isAdded ? styles.partAdded : ""}>
                <span className={styles.partCallout}>{part.number}</span>
                <div><strong>{part.name}</strong><small className={part.status === "In stock" ? styles.inStock : part.status === "Low stock" || part.status === "Backorder" ? styles.limitedStock : ""}>{part.status}</small></div>
                <b>{part.price || "—"}</b>
                <ConversionButton disabled={!isAvailable || isAdded} onClick={() => addPart(part.number)}>{isAdded ? "Added" : "Add"}</ConversionButton>
              </li>;
            })}
          </ol>
        </aside>
      </div>
    </div>
  );
}

function HirePage() {
  const [pickupDate, setPickupDate] = useState("2026-09-18");
  const [returnDate, setReturnDate] = useState("2026-09-20");
  const [vehicleType, setVehicleType] = useState("all");
  const [availabilityChecked, setAvailabilityChecked] = useState(true);
  const [selectedHire, setSelectedHire] = useState("Adventure 500");
  const [helmet, setHelmet] = useState(false);
  const [delivery, setDelivery] = useState(false);
  const hireVehicles = [
    { name: "Adventure 500", type: "adventure", price: 129, detail: "500cc · Manual · 2 seats" },
    { name: "Urban 250", type: "scooter", price: 89, detail: "250cc · Automatic · 2 seats" },
    { name: "Touring 650", type: "touring", price: 149, detail: "650cc · Manual · Luggage" },
  ];
  const availableVehicles = hireVehicles.filter((item) => vehicleType === "all" || item.type === vehicleType);
  const selectedVehicle = hireVehicles.find((item) => item.name === selectedHire);
  const pickup = new Date(`${pickupDate}T00:00:00`);
  const dropoff = new Date(`${returnDate}T00:00:00`);
  const hireDays = Number.isNaN(pickup.getTime()) || Number.isNaN(dropoff.getTime()) ? 1 : Math.max(1, Math.ceil((dropoff.getTime() - pickup.getTime()) / 86400000));
  const hireTotal = (selectedVehicle?.price || 0) * hireDays + (helmet ? 10 * hireDays : 0) + (delivery ? 45 : 0);
  const updateDates = (setter: (value: string) => void, value: string) => { setter(value); setAvailabilityChecked(false); };

  return (
    <div className={styles.examplePage}>
      <PageHeading eyebrow="Online hire" title="Choose a date. Start exploring." detail="3 vehicles available" />
      <form className={styles.hireSearch} onSubmit={(event) => { event.preventDefault(); setAvailabilityChecked(true); setSelectedHire(""); }}>
        <label><span>Pick up</span><input type="date" value={pickupDate} onChange={(event) => updateDates(setPickupDate, event.target.value)} /></label>
        <i>→</i>
        <label><span>Return</span><input type="date" min={pickupDate} value={returnDate} onChange={(event) => updateDates(setReturnDate, event.target.value)} /></label>
        <label><span>Vehicle type</span><select value={vehicleType} onChange={(event) => { setVehicleType(event.target.value); setSelectedHire(""); }}><option value="all">All vehicles</option><option value="scooter">Scooter</option><option value="adventure">Adventure</option><option value="touring">Touring</option></select></label>
        <button type="submit">Check availability</button>
      </form>

      <div className={styles.hireResults}><div><strong>{availabilityChecked ? `${availableVehicles.length} available` : "Dates changed"}</strong><span>{availabilityChecked ? `${hireDays} day${hireDays === 1 ? "" : "s"} · unlimited kilometres` : "Refresh availability to see updated vehicles."}</span></div><b>✓ Insurance included</b></div>
      {availabilityChecked && <div className={styles.hireGrid}>{availableVehicles.map((item) => <article key={item.name} className={selectedHire === item.name ? styles.selectedHireCard : ""}><MiniVehicle /><small>{item.type}</small><strong>{item.name}</strong><span>{item.detail}</span><p>From <b>${item.price}</b> / day</p><button type="button" onClick={() => setSelectedHire(item.name)}>{selectedHire === item.name ? "Selected" : "Choose vehicle →"}</button></article>)}</div>}

      {selectedVehicle && availabilityChecked && <section className={styles.hireCheckout}>
        <div className={styles.hireSelection}><small>Your hire</small><strong>{selectedVehicle.name}</strong><span>{hireDays} day{hireDays === 1 ? "" : "s"} · {pickupDate} to {returnDate}</span></div>
        <div className={styles.hireExtras}><label><input type="checkbox" checked={helmet} onChange={(event) => setHelmet(event.target.checked)} /><span><b>Helmet hire</b><small>+$10 / day</small></span></label><label><input type="checkbox" checked={delivery} onChange={(event) => setDelivery(event.target.checked)} /><span><b>Deliver to me</b><small>+$45 once</small></span></label></div>
        <div className={styles.hireTotal}><span>Estimated total</span><strong>${hireTotal}</strong><ConversionButton>Reserve online →</ConversionButton></div>
      </section>}
    </div>
  );
}

function ServicePage() {
  const [step, setStep] = useState(1);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [customer, setCustomer] = useState("");
  const [booked, setBooked] = useState(false);
  const serviceOptions = [
    { name: "Scheduled service & maintenance", description: "Routine servicing, inspections and manufacturer maintenance." },
    { name: "Diagnosis or repair", description: "For a vehicle that will not start, feels different or needs repair." },
    { name: "Tyre fitting", description: "Supply and fit, fit-only replacement or wheel balancing." },
  ];
  const calendarDays = [null, ...Array.from({ length: 30 }, (_, index) => index + 1)];
  const unavailableDays = [1, 2, 3, 4, 5, 6, 10, 12, 13, 19, 20, 21, 26, 27];
  const canProceed = Boolean(selectedDate && time && serviceTypes.length);
  const toggleServiceType = (name: string) => setServiceTypes((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);

  return (
    <div className={styles.serviceBookingPage}>
      <section className={styles.serviceBookingHero}>
        <div className={styles.serviceHeroCopy}>
          <small>Workshop servicing</small>
          <h2>Get your<br />bike<br /><em>sorted.</em></h2>
          <p>Experienced servicing and repairs with free online booking. We&apos;ll provide a clear estimate before work begins.</p>
          <ul><li><i>✓</i> Mechanical servicing and repairs</li><li><i>✓</i> Tyre fitting and wheel balancing</li><li><i>✓</i> All major makes and models</li><li><i>✓</i> Pickup can be arranged</li></ul>
        </div>

        <div className={styles.serviceBookingCard}>
          <header><div><h3>Book your service</h3><span>✓ Free to book</span></div><p>Step {step} of 3 — {step === 1 ? "pick a drop-off time and tell us what your vehicle needs." : step === 2 ? "tell us about your bike." : "check the booking details."}</p></header>

          {step === 1 && <div className={styles.serviceBookingFields}>
            <div className={styles.serviceDateTimeFields}>
              <div className={styles.bookingField}><label htmlFor="service-date">Drop-off date *</label><button id="service-date" type="button" className={`${styles.datePickerTrigger} ${selectedDate ? styles.dateChosen : ""}`} onClick={() => setCalendarOpen((current) => !current)} aria-expanded={calendarOpen}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3v3m14-3v3M4 8h16M4 5h16v16H4z" /></svg><span>{selectedDate || "Pick a date"}</span><b>⌄</b></button>
                {calendarOpen && <div className={styles.bookingCalendar}><header><button type="button" aria-label="Previous month">‹</button><strong>September 2026</strong><button type="button" aria-label="Next month">›</button></header><div className={styles.calendarGrid}>{["M", "T", "W", "T", "F", "S", "S"].map((weekday, index) => <span key={`${weekday}-${index}`}>{weekday}</span>)}{calendarDays.map((date, index) => date === null ? <i key={`blank-${index}`} /> : <button key={date} type="button" disabled={unavailableDays.includes(date)} className={selectedDate === `${date} September 2026` ? styles.selectedCalendarDay : ""} onClick={() => { setSelectedDate(`${date} September 2026`); setTime(""); setCalendarOpen(false); }}>{date}</button>)}</div><small>Unavailable days cannot be selected</small></div>}
              </div>
              <div className={styles.bookingField}><label htmlFor="service-time">Drop-off time *</label><select id="service-time" value={time} onChange={(event) => setTime(event.target.value)} disabled={!selectedDate}><option value="">Select a time</option>{["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"].map((slot) => <option key={slot}>{slot}</option>)}</select></div>
            </div>
            <div className={styles.jobTypeField}><strong>Job type *</strong><p>Select one or more services you require.</p><div>{serviceOptions.map((option) => <label key={option.name}><input type="checkbox" checked={serviceTypes.includes(option.name)} onChange={() => toggleServiceType(option.name)} /><span><b>{option.name}</b><small>{option.description}</small></span></label>)}</div></div>
            <label><span>Notes</span><small className={styles.bookingFieldHelp}>Any details about the issue—sounds, circumstances or specific concerns.</small><textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add any notes for the mechanic" /></label>
          </div>}

          {step === 2 && <div className={styles.serviceBookingFields}>
            <label><span>Your motorcycle or scooter</span><input value={vehicle} onChange={(event) => setVehicle(event.target.value)} placeholder="e.g. 2022 Horizon Touring X" /></label>
            <label><span>Your name</span><input value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="Full name" /></label>
            <label><span>Anything we should know?</span><textarea rows={4} placeholder="Describe a noise, issue or anything you would like checked..." /></label>
          </div>}

          {step === 3 && <div className={styles.bookingReview}><small>Booking summary</small><dl><div><dt>Service</dt><dd>{serviceTypes.join(", ")}</dd></div><div><dt>Drop-off</dt><dd>{selectedDate} · {time}</dd></div><div><dt>Vehicle</dt><dd>{vehicle || "Vehicle details at drop-off"}</dd></div><div><dt>Name</dt><dd>{customer || "To be confirmed"}</dd></div></dl>{notes && <p><strong>Notes:</strong> {notes}</p>}<p>No payment is required. The workshop will confirm the booking and provide an estimate.</p>{booked && <strong>Thanks—your booking request has been sent.</strong>}</div>}

          <footer>{step > 1 ? <button type="button" onClick={() => { setBooked(false); setStep((current) => current - 1); }}>← Back</button> : <span />}{step === 1 ? <button type="button" disabled={!canProceed} onClick={() => setStep(2)}>Next: Vehicle details</button> : step === 2 ? <button type="button" onClick={() => setStep(3)}>Review booking →</button> : <ConversionButton onClick={() => setBooked(true)}>Request booking →</ConversionButton>}</footer>
        </div>
      </section>

      <section className={styles.serviceReviews}>
        <div><small>Trusted local workshop</small><strong>4.9 <span>★★★★★</span></strong><p>Based on 186 verified service customers</p></div>
        <blockquote><span>“</span><p>Easy to book, excellent communication and my vehicle was ready exactly when promised.</p><footer>— Matt R. · Annual service</footer></blockquote>
        <blockquote><span>“</span><p>The team explained everything clearly and made the whole workshop visit effortless.</p><footer>— Amelia K. · First service</footer></blockquote>
      </section>
      <section className={styles.serviceWork}><header><small>What we do</small><h3>Workshop support for every kind of ride.</h3></header><div><article><i>01</i><strong>No-start diagnosis &amp; service</strong><p>We trace electrical, fuel or mechanical faults and explain the work before getting started.</p></article><article><i>02</i><strong>Running vehicle diagnosis &amp; service</strong><p>Scheduled maintenance, inspections and repairs to keep your vehicle performing at its best.</p></article><article><i>03</i><strong>Tyre fitting</strong><p>Supply and fit or fit-only tyre changes, replacement and wheel balancing.</p></article></div></section>
      <section className={styles.findUsSection}>
        <div className={styles.findUsCopy}><small>How to find us</small><h3>Visit our service centre.</h3><p>Your workshop address</p><span>Mon–Fri 8:00–5:30<br />Saturday 8:00–1:00</span><ConversionButton>Get directions ↗</ConversionButton></div>
        <DemoMap className={styles.serviceMap} ariaLabel="Map showing the service centre at a road intersection" />
      </section>
    </div>
  );
}

function ArticlesPage() {
  return (
    <div className={styles.examplePage}>
      <PageHeading eyebrow="Advice and ownership" title="Guides for the road ahead." detail="View all guides →" />
      <div className={styles.journalFeature}><div /><section><small>Buying guide · 7 min</small><h3>How to choose the right machine for the way you ride.</h3><p>A practical guide to finding the right balance of comfort, performance and everyday usability.</p><b>Read the guide →</b></section></div>
      <div className={styles.journalGrid}><article><i /><small>Ownership</small><strong>Preparing for your first service</strong></article><article><i /><small>Routes</small><strong>Three perfect weekend escapes</strong></article></div>
    </div>
  );
}

function ContactPage({ brandName }: { brandName: string }) {
  const [sent, setSent] = useState(false);
  const emailName = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18) || "yourdealership";

  return (
    <div className={styles.examplePage}>
      <PageHeading eyebrow="Contact our team" title="How can we help?" detail="Replies within one business day" />
      <div className={styles.contactPageGrid}>
        <aside className={styles.contactPageDetails}>
          <small>Speak with the dealership</small><h3>Real advice, without the runaround.</h3><p>Ask about a vehicle, book a visit or tell us what you need help finding.</p>
          <ConversionLink href="tel:+61861234567"><span>Phone</span><strong>(08) 6123 4567</strong></ConversionLink>
          <ConversionLink href={`mailto:hello@${emailName}.com.au`}><span>Email</span><strong>hello@{emailName}.com.au</strong></ConversionLink>
          <div><span>Visit</span><strong>Your dealership address</strong></div>
        </aside>
        <form className={styles.contactForm} onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
          <label><span>Name</span><input placeholder="Your name" /></label>
          <label><span>Email</span><input type="email" placeholder="you@email.com" /></label>
          <label><span>Phone</span><input type="tel" placeholder="04xx xxx xxx" /></label>
          <label><span>What can we help with?</span><select defaultValue="Vehicle enquiry"><option>Vehicle enquiry</option><option>Service booking</option><option>Parts</option><option>Something else</option></select></label>
          <label className={styles.contactMessage}><span>Message</span><textarea placeholder="Tell us a little more..." rows={4} /></label>
          <ConversionButton type="submit">Send enquiry →</ConversionButton>
          {sent && <p className={styles.contactSuccess}>Thanks—your enquiry has been sent to the team.</p>}
        </form>
      </div>
      <div className={styles.contactLocation}><div><small>Find us</small><strong>Easy to reach. Easy to park.</strong><span>Mon–Fri 8:00–5:30 · Saturday 8:00–1:00</span></div><DemoMap className={styles.contactSimpleMap} ariaLabel="Map showing the location at a road intersection" /></div>
    </div>
  );
}

function TermsPage() {
  return (
    <div className={`${styles.examplePage} ${styles.termsPage}`}>
      <PageHeading eyebrow="Customer information" title="Terms & conditions." detail="Last updated September 2026" />
      <div className={styles.termsIntro}><strong>Clear terms make every next step easier.</strong><p>This demonstration shows how dealership policies can be presented in a readable, well-structured format. Final terms would be reviewed and supplied by the dealership.</p></div>
      <div className={styles.termsGrid}>
        <section><span>01</span><div><h3>Vehicle enquiries and availability</h3><p>Vehicle listings are subject to availability. Submitting an enquiry does not reserve a vehicle unless a deposit has been accepted and confirmed.</p></div></section>
        <section><span>02</span><div><h3>Deposits and online purchases</h3><p>Any applicable deposit, balance and cancellation conditions are shown clearly before the customer confirms an online transaction.</p></div></section>
        <section><span>03</span><div><h3>Service and hire bookings</h3><p>Booking times remain provisional until confirmed. Hire eligibility, identification and licence requirements may apply.</p></div></section>
        <section><span>04</span><div><h3>Privacy and customer information</h3><p>Customer information is collected only where required to respond, process a transaction or provide the requested dealership service.</p></div></section>
      </div>
      <div className={styles.termsHelp}><span>Questions about these terms?</span><strong>Contact our team for a clear answer before proceeding.</strong></div>
    </div>
  );
}

export function ExamplePage({ page, inventoryAddons, brandName, selectedVehicle, onVehicleOpen, onPageChange }: ExamplePageProps) {
  if (page === "inventory") return <InventoryPage inventoryAddons={inventoryAddons} onVehicleOpen={onVehicleOpen} />;
  if (page === "vehicle") return <VehicleDetailsPage vehicle={selectedVehicle} inventoryAddons={inventoryAddons} onBack={() => onPageChange("inventory")} />;
  if (page === "accessories") return <AccessoriesPage />;
  if (page === "parts") return <PartsPage />;
  if (page === "hire") return <HirePage />;
  if (page === "service") return <ServicePage />;
  if (page === "contact") return <ContactPage brandName={brandName} />;
  if (page === "terms") return <TermsPage />;
  return <ArticlesPage />;
}
