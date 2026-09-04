"use client";

import { useState, type CSSProperties } from "react";

import { ACCENTS } from "./configuratorData";
import { ConversionLink } from "./ConversionButton";
import { DemoMap } from "./DemoMap";
import { ExamplePage, INVENTORY_VEHICLES, InventoryTile, type InventoryVehicle } from "./PreviewPages";
import styles from "./page.module.css";
import type { Accent, InventoryAddonSelection, ModuleSelection, PreviewPage } from "./types";

type WebsitePreviewProps = {
  accent: Accent;
  brandName: string;
  currentUrl: string;
  selected: ModuleSelection;
  inventoryAddons: InventoryAddonSelection;
  previewPage: PreviewPage;
  additionCount: number;
  onPageChange: (page: PreviewPage) => void;
};

function BrandWordmark({ name }: { name: string }) {
  const displayName = name.trim() || "Your brand";
  const splitAt = Math.max(1, Math.ceil(displayName.length * .55));

  return <>{displayName.slice(0, splitAt)}<span>{displayName.slice(splitAt)}.</span></>;
}

function PreviewNavigation({ brandName, selected, previewPage, onPageChange }: Pick<WebsitePreviewProps, "brandName" | "selected" | "previewPage" | "onPageChange">) {
  const navigation: Array<{ key: Exclude<PreviewPage, "home" | "vehicle" | "contact" | "terms">; label: string }> = [
    { key: "inventory", label: "Stock" },
    { key: "accessories", label: "Accessories" },
    { key: "parts", label: "Parts" },
    { key: "hire", label: "Hire" },
    { key: "service", label: "Service" },
    { key: "articles", label: "Guides" },
  ];
  const emailName = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18) || "yourdealership";

  return (
    <div className={styles.siteNav}>
      <button className={styles.previewBrand} onClick={() => onPageChange("home")} aria-label="View example home page"><BrandWordmark name={brandName} /></button>
      <div className={styles.siteNavActions}>
        <div className={styles.siteNavLinks}>
          {navigation.map((item) => selected[item.key] && <button key={item.key} className={previewPage === item.key ? styles.activeNav : ""} onClick={() => onPageChange(item.key)}>{item.label}</button>)}
          <button className={`${styles.contactNav} ${previewPage === "contact" ? styles.activeNav : ""}`} onClick={() => onPageChange("contact")}>Contact</button>
        </div>
        <div className={styles.previewContacts}>
          <ConversionLink href={`mailto:hello@${emailName}.com.au`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM4 7l8 6 8-6" /></svg><small>hello@{emailName}.com.au</small></ConversionLink>
          <ConversionLink href="tel:+61861234567"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 3.8 10 7.7 8.2 9.5c1.3 2.6 3.6 4.9 6.3 6.3l1.8-1.8 3.9 2.8-.7 3.2c-.2.8-1 1.3-1.8 1.2C9.9 20.1 3.9 14.1 2.8 6.3c-.1-.8.4-1.6 1.2-1.8z" /></svg><small>(08) 6123 4567</small></ConversionLink>
        </div>
      </div>
    </div>
  );
}

function HomePreview({ brandName, selected, inventoryAddons, onPageChange, onVehicleOpen }: Pick<WebsitePreviewProps, "brandName" | "selected" | "inventoryAddons" | "onPageChange"> & { onVehicleOpen: (vehicle: InventoryVehicle) => void }) {
  return (
    <>
      <div className={styles.siteHero}>
        <div className={styles.heroCopy}>
          <small>Built for what comes next</small>
          <h2>Find your<br />next machine.</h2>
          <p>Vehicles, service and experienced advice—all in one clear place.</p>
          <button onClick={() => onPageChange(selected.inventory ? "inventory" : "contact")}>{selected.inventory ? "Explore inventory →" : "Talk to our team →"}</button>
        </div>
        <div className={styles.vehicle} aria-hidden="true"><span /><i /><i /></div>
      </div>

      <section className={styles.reviewsBlock} aria-label="Customer reviews example">
        <div><strong>4.9</strong><span>★★★★★</span><small>Customer rating</small></div>
        <blockquote>“Straightforward advice, a great range and genuinely excellent service from the first conversation.”</blockquote>
        <div className={styles.reviewAuthor}><strong>Michael R.</strong><span>Verified customer</span></div>
      </section>

      {selected.inventory && <div className={styles.inventoryBlock}><div><strong>Featured inventory</strong><button onClick={() => onPageChange("inventory")}>View all stock →</button></div><div className={`${styles.catalogueGrid} ${styles.featuredInventoryGrid}`}>{INVENTORY_VEHICLES.slice(0, 3).map((vehicle) => <InventoryTile key={vehicle.name} vehicle={vehicle} inventoryAddons={inventoryAddons} onOpen={() => onVehicleOpen(vehicle)} />)}</div></div>}

      <div className={styles.dynamicArea}>
        {selected.hire && <div className={styles.hireCard}><small>Available this weekend</small><strong>Put adventure on the calendar.</strong><span>Check hire availability →</span></div>}
        {selected.articles && <div className={styles.articleCard}><div className={styles.guideImage} aria-hidden="true"><span /><i /><b /></div><div><small>From the guides</small><strong>How to choose the right machine</strong><span>6 min read</span></div></div>}
        {selected.service && <div className={styles.serviceCard}><span>Next available</span><strong>Tuesday · 9:30 am</strong><b>Book service →</b></div>}
      </div>

      <section className={styles.baseDetails}>
        <div className={styles.aboutBlock}><small>About {brandName.trim() || "your dealership"}</small><h3>Good machines.<br />Better advice.</h3><p>We help riders find the right vehicle and keep it performing for the road ahead.</p><button>Meet the dealership →</button></div>
        <div className={styles.brandsBlock}><small>Brands we work with</small><div><strong>HORIZON</strong><strong>NORTH / CO</strong><strong>AXIS</strong><strong>TRAILWORKS</strong></div></div>
      </section>

      <section className={styles.contactBand}><div><small>Have a question?</small><strong>Talk with someone who knows the stock.</strong></div><button onClick={() => onPageChange("contact")}>Contact the team →</button></section>
    </>
  );
}

function PreviewFooter({ brandName, selected, onPageChange }: Pick<WebsitePreviewProps, "brandName" | "selected" | "onPageChange">) {
  const emailName = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18) || "yourdealership";

  return (
    <footer className={styles.previewFooter}>
      <div className={styles.footerBrand}><button onClick={() => onPageChange("home")}><BrandWordmark name={brandName} /></button><small>Vehicles · Service · Advice</small></div>
      <div className={styles.footerLinks}><strong>Explore</strong><nav aria-label="Example website footer"><button onClick={() => onPageChange("home")}>Home <span>→</span></button>{selected.inventory && <button onClick={() => onPageChange("inventory")}>Stock <span>→</span></button>}{selected.parts && <button onClick={() => onPageChange("parts")}>Parts <span>→</span></button>}{selected.service && <button onClick={() => onPageChange("service")}>Service <span>→</span></button>}{selected.articles && <button onClick={() => onPageChange("articles")}>Guides <span>→</span></button>}<button onClick={() => onPageChange("contact")}>Contact <span>→</span></button></nav></div>
      <div className={styles.footerContact}><strong>Contact</strong><ConversionLink href="tel:+61861234567"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 3.8 10 7.7 8.2 9.5c1.3 2.6 3.6 4.9 6.3 6.3l1.8-1.8 3.9 2.8-.7 3.2c-.2.8-1 1.3-1.8 1.2C9.9 20.1 3.9 14.1 2.8 6.3c-.1-.8.4-1.6 1.2-1.8z" /></svg><span>(08) 6123 4567</span></ConversionLink><ConversionLink href={`mailto:hello@${emailName}.com.au`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM4 7l8 6 8-6" /></svg><span>hello@{emailName}.com.au</span></ConversionLink><p>Your dealership address</p></div>
      <DemoMap className={styles.footerMap} onClick={() => onPageChange("contact")} ariaLabel="View location on the contact page" actionLabel="Find us →" />
      <div className={styles.footerLegal}><span>© 2026 {brandName.trim() || "Your dealership"}</span><button onClick={() => onPageChange("terms")}>Terms &amp; conditions</button></div>
    </footer>
  );
}

export function WebsitePreview(props: WebsitePreviewProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<InventoryVehicle>(INVENTORY_VEHICLES[0]);
  const { accent, brandName, currentUrl, selected, inventoryAddons, previewPage, additionCount, onPageChange } = props;
  const previewStyle = { "--preview-accent": ACCENTS[accent] } as CSSProperties;
  const enteredAddress = currentUrl.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const websiteAddress = enteredAddress || `www.${brandName.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 22) || "yourdealership"}.com.au`;
  const openVehicle = (vehicle: InventoryVehicle) => { setSelectedVehicle(vehicle); onPageChange("vehicle"); };

  return (
    <section className={styles.previewColumn} aria-label="Live website preview" style={previewStyle}>
      <div className={styles.previewLabel}><span>Live website preview</span><b>{additionCount} additions active</b></div>
      <div className={styles.previewGuide} aria-label="How to use the website builder">
        <div><b>01</b><span><strong>Customize</strong><small>Choose your capabilities</small></span></div>
        <div><b>02</b><span><strong>Interact</strong><small>Click through the preview</small></span></div>
        <div><b>03</b><span><strong>Checkout</strong><small>Review your build</small></span></div>
      </div>
      <div className={styles.browser}>
        <div className={styles.browserTop}><div><i /><i /><i /></div><span>{websiteAddress}</span>{selected.integrations && <b className={styles.syncStatus}>● Systems synced</b>}</div>
        <PreviewNavigation brandName={brandName} selected={selected} previewPage={previewPage} onPageChange={onPageChange} />
        {previewPage === "home" ? <HomePreview brandName={brandName} selected={selected} inventoryAddons={inventoryAddons} onPageChange={onPageChange} onVehicleOpen={openVehicle} /> : <ExamplePage page={previewPage} inventoryAddons={inventoryAddons} brandName={brandName} selectedVehicle={selectedVehicle} onVehicleOpen={openVehicle} onPageChange={onPageChange} />}
        <PreviewFooter brandName={brandName} selected={selected} onPageChange={onPageChange} />
      </div>
    </section>
  );
}
