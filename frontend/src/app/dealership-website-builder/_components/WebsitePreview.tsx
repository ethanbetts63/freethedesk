"use client";

import { useState, type CSSProperties } from "react";

import { ACCENTS, PREVIEW_NAVIGATION } from "../_lib/configuratorData";
import { getDemoBrandIdentity } from "../_lib/demoBrand";
import { ConversionLink } from "./ConversionButton";
import { DemoMap } from "./DemoMap";
import { BrandArtwork, LandscapeArtwork, VehicleArtwork } from "./PreviewArtwork";
import { ExamplePage, INVENTORY_VEHICLES, InventoryTile, type InventoryVehicle } from "./PreviewPages";
import layoutStyles from "../_styles/layout.module.css";
import previewStyles from "../_styles/preview.module.css";
import type { Accent, InventoryAddonSelection, ModuleSelection, PreviewPage } from "../_lib/types";

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

const styles = { ...layoutStyles, ...previewStyles };

function BrandWordmark({ name }: { name: string }) {
  const displayName = name.trim() || "Your brand";
  const splitAt = Math.max(1, Math.ceil(displayName.length * 0.55));

  return (
    <>
      {displayName.slice(0, splitAt)}
      <span>{displayName.slice(splitAt)}.</span>
    </>
  );
}

function PreviewNavigation({
  brandName,
  selected,
  previewPage,
  onPageChange,
}: Pick<WebsitePreviewProps, "brandName" | "selected" | "previewPage" | "onPageChange">) {
  const { email } = getDemoBrandIdentity(brandName);

  return (
    <div className={styles.siteNav}>
      <button
        type="button"
        className={styles.previewBrand}
        onClick={() => onPageChange("home")}
        aria-label="View example home page"
      >
        <BrandWordmark name={brandName} />
      </button>
      <div className={styles.siteNavActions}>
        <div className={styles.siteNavLinks}>
          {PREVIEW_NAVIGATION.map(
            (item) =>
              selected[item.moduleKey] && (
                <button
                  type="button"
                  key={item.page}
                  className={previewPage === item.page ? styles.activeNav : ""}
                  onClick={() => onPageChange(item.page)}
                >
                  {item.label}
                </button>
              ),
          )}
          <button
            type="button"
            className={`${styles.contactNav} ${previewPage === "contact" ? styles.activeNav : ""}`}
            onClick={() => onPageChange("contact")}
          >
            Contact
          </button>
        </div>
        <div className={styles.previewContacts}>
          <ConversionLink href={`mailto:${email}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 5h16v14H4zM4 7l8 6 8-6" />
            </svg>
            <small>{email}</small>
          </ConversionLink>
          <ConversionLink href="tel:+61861234567">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7.2 3.8 10 7.7 8.2 9.5c1.3 2.6 3.6 4.9 6.3 6.3l1.8-1.8 3.9 2.8-.7 3.2c-.2.8-1 1.3-1.8 1.2C9.9 20.1 3.9 14.1 2.8 6.3c-.1-.8.4-1.6 1.2-1.8z" />
            </svg>
            <small>(08) 6123 4567</small>
          </ConversionLink>
        </div>
      </div>
    </div>
  );
}

function HomePreview({
  brandName,
  selected,
  inventoryAddons,
  onPageChange,
  onVehicleOpen,
}: Pick<WebsitePreviewProps, "brandName" | "selected" | "inventoryAddons" | "onPageChange"> & {
  onVehicleOpen: (vehicle: InventoryVehicle) => void;
}) {
  return (
    <>
      <div className={styles.siteHero}>
        <div className={styles.heroCopy}>
          <small>Built for what comes next</small>
          <h2>
            Find your
            <br />
            next machine.
          </h2>
          <p>Vehicles, service and experienced advice—all in one clear place.</p>
          <button type="button" onClick={() => onPageChange(selected.inventory ? "inventory" : "contact")}>
            {selected.inventory ? "Explore inventory →" : "Talk to our team →"}
          </button>
        </div>
        <div className={styles.vehicle}>
          <VehicleArtwork />
        </div>
      </div>

      <section className={styles.reviewsBlock} aria-label="Customer reviews example">
        <div>
          <strong>4.9</strong>
          <span>★★★★★</span>
          <small>Customer rating</small>
        </div>
        <blockquote>
          “Straightforward advice, a great range and genuinely excellent service from the first conversation.”
        </blockquote>
        <div className={styles.reviewAuthor}>
          <strong>Michael R.</strong>
          <span>Verified customer</span>
        </div>
      </section>

      {selected.inventory && (
        <div className={styles.inventoryBlock}>
          <div>
            <strong>Featured inventory</strong>
            <button type="button" onClick={() => onPageChange("inventory")}>
              View all stock →
            </button>
          </div>
          <div className={`${styles.catalogueGrid} ${styles.featuredInventoryGrid}`}>
            {INVENTORY_VEHICLES.slice(0, 3).map((vehicle) => (
              <InventoryTile
                key={vehicle.name}
                vehicle={vehicle}
                inventoryAddons={inventoryAddons}
                onOpen={() => onVehicleOpen(vehicle)}
              />
            ))}
          </div>
        </div>
      )}

      <div className={styles.dynamicArea}>
        {selected.hire && (
          <div className={styles.hireCard}>
            <small>Available this weekend</small>
            <strong>Put adventure on the calendar.</strong>
            <span>Check hire availability →</span>
          </div>
        )}
        {selected.articles && (
          <div className={styles.articleCard}>
            <div className={styles.guideImage}>
              <LandscapeArtwork />
            </div>
            <div>
              <small>From the guides</small>
              <strong>How to choose the right machine</strong>
              <span>6 min read</span>
            </div>
          </div>
        )}
        {selected.service && (
          <div className={styles.serviceCard}>
            <span>Next available</span>
            <strong>Tuesday · 9:30 am</strong>
            <b>Book service →</b>
          </div>
        )}
      </div>

      <section className={styles.baseDetails}>
        <div className={styles.aboutBlock}>
          <small>About {brandName.trim() || "your dealership"}</small>
          <h3>
            Good machines.
            <br />
            Better advice.
          </h3>
          <p>We help riders find the right vehicle and keep it performing for the road ahead.</p>
          <button type="button">Meet the dealership →</button>
        </div>
        <div className={styles.brandsBlock}>
          <small>Brands we work with</small>
          <div className={styles.brandGrid}>
            <article>
              <BrandArtwork label="Horizon" />
              <span>
                <strong>Horizon</strong>
                <small>Road &amp; touring</small>
              </span>
            </article>
            <article>
              <BrandArtwork label="North / Co" />
              <span>
                <strong>North / Co</strong>
                <small>Urban mobility</small>
              </span>
            </article>
            <article>
              <BrandArtwork label="Axis" />
              <span>
                <strong>Axis</strong>
                <small>Performance</small>
              </span>
            </article>
            <article>
              <BrandArtwork label="Trailworks" />
              <span>
                <strong>Trailworks</strong>
                <small>Adventure</small>
              </span>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.contactBand}>
        <div>
          <small>Have a question?</small>
          <strong>Talk with someone who knows the stock.</strong>
        </div>
        <button type="button" onClick={() => onPageChange("contact")}>
          Contact the team →
        </button>
      </section>
    </>
  );
}

function PreviewFooter({
  brandName,
  selected,
  onPageChange,
}: Pick<WebsitePreviewProps, "brandName" | "selected" | "onPageChange">) {
  const { email } = getDemoBrandIdentity(brandName);

  return (
    <footer className={styles.previewFooter}>
      <div className={styles.footerBrand}>
        <button type="button" onClick={() => onPageChange("home")}>
          <BrandWordmark name={brandName} />
        </button>
        <small>Vehicles · Service · Advice</small>
      </div>
      <div className={styles.footerLinks}>
        <strong>Explore</strong>
        <nav aria-label="Example website footer">
          <button type="button" onClick={() => onPageChange("home")}>
            Home <span>→</span>
          </button>
          {PREVIEW_NAVIGATION.filter((item) => item.footer && selected[item.moduleKey]).map((item) => (
            <button type="button" key={item.page} onClick={() => onPageChange(item.page)}>
              {item.label} <span>→</span>
            </button>
          ))}
          <button type="button" onClick={() => onPageChange("contact")}>
            Contact <span>→</span>
          </button>
        </nav>
      </div>
      <div className={styles.footerContact}>
        <strong>Contact</strong>
        <ConversionLink href="tel:+61861234567">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7.2 3.8 10 7.7 8.2 9.5c1.3 2.6 3.6 4.9 6.3 6.3l1.8-1.8 3.9 2.8-.7 3.2c-.2.8-1 1.3-1.8 1.2C9.9 20.1 3.9 14.1 2.8 6.3c-.1-.8.4-1.6 1.2-1.8z" />
          </svg>
          <span>(08) 6123 4567</span>
        </ConversionLink>
        <ConversionLink href={`mailto:${email}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 5h16v14H4zM4 7l8 6 8-6" />
          </svg>
          <span>{email}</span>
        </ConversionLink>
        <p>Your dealership address</p>
      </div>
      <DemoMap
        className={styles.footerMap}
        onClick={() => onPageChange("contact")}
        ariaLabel="View location on the contact page"
        actionLabel="Find us →"
      />
      <div className={styles.footerLegal}>
        <span>© 2026 {brandName.trim() || "Your dealership"}</span>
        <button type="button" onClick={() => onPageChange("terms")}>
          Terms &amp; conditions
        </button>
      </div>
    </footer>
  );
}

export function WebsitePreview(props: WebsitePreviewProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<InventoryVehicle>(INVENTORY_VEHICLES[0]);
  const { accent, brandName, currentUrl, selected, inventoryAddons, previewPage, additionCount, onPageChange } = props;
  const previewStyle = { "--preview-accent": ACCENTS[accent] } as CSSProperties;
  const { websiteAddress } = getDemoBrandIdentity(brandName, currentUrl);
  const openVehicle = (vehicle: InventoryVehicle) => {
    setSelectedVehicle(vehicle);
    onPageChange("vehicle");
  };

  return (
    <section className={styles.previewColumn} aria-label="Live website preview" style={previewStyle}>
      <div className={styles.previewLabel}>
        <span>Live website preview</span>
        <b>{additionCount} additions active</b>
      </div>
      <div className={styles.previewGuide} aria-label="How to use the website builder">
        <div>
          <b>01</b>
          <span>
            <strong>Customize</strong>
            <small>Add your brand and capabilities</small>
          </span>
        </div>
        <div>
          <b>02</b>
          <span>
            <strong>Explore</strong>
            <small>Use the live website preview</small>
          </span>
        </div>
        <div>
          <b>03</b>
          <span>
            <strong>Send it</strong>
            <small>Give the configuration to our team</small>
          </span>
        </div>
      </div>
      <div className={styles.browser}>
        <div className={styles.browserTop}>
          <div>
            <i />
            <i />
            <i />
          </div>
          <span>{websiteAddress}</span>
          {selected.integrations && <b className={styles.syncStatus}>● Systems synced</b>}
        </div>
        <PreviewNavigation
          brandName={brandName}
          selected={selected}
          previewPage={previewPage}
          onPageChange={onPageChange}
        />
        {previewPage === "home" ? (
          <HomePreview
            brandName={brandName}
            selected={selected}
            inventoryAddons={inventoryAddons}
            onPageChange={onPageChange}
            onVehicleOpen={openVehicle}
          />
        ) : (
          <ExamplePage
            page={previewPage}
            inventoryAddons={inventoryAddons}
            brandName={brandName}
            selectedVehicle={selectedVehicle}
            onVehicleOpen={openVehicle}
            onPageChange={onPageChange}
          />
        )}
        <PreviewFooter brandName={brandName} selected={selected} onPageChange={onPageChange} />
      </div>
    </section>
  );
}
