"use client";

import { useState } from "react";

import { ConversionButton } from "../ConversionButton";
import { VehicleArtwork } from "../PreviewArtwork";
import type { InventoryVehicle } from "./data";
import { MiniVehicle, OnlinePurchaseSteps } from "./shared";
import type { InventoryAddonSelection } from "../../_lib/types";
import styles from "../../page.module.css";

export function VehicleDetailsPage({
  vehicle,
  inventoryAddons,
  onBack,
}: {
  vehicle: InventoryVehicle;
  inventoryAddons: InventoryAddonSelection;
  onBack: () => void;
}) {
  const [galleryImage, setGalleryImage] = useState(0);
  const [interestEmail, setInterestEmail] = useState("");
  const [interestSent, setInterestSent] = useState(false);
  const showOnlineSteps = inventoryAddons.contract && inventoryAddons.licensing;

  return (
    <div className={styles.vehicleDetailPage}>
      <button type="button" className={styles.backToInventory} onClick={onBack}>
        ← Back to inventory
      </button>
      <section className={styles.vehicleGallery}>
        <div className={`${styles.vehicleGalleryMain} ${styles[`galleryTone${galleryImage + 1}`]}`}>
          <div className={styles.detailVehicleVisual}>
            <VehicleArtwork />
          </div>
          <span>
            {vehicle.year} · {vehicle.brand}
          </span>
        </div>
        <div className={styles.galleryThumbs}>
          {[0, 1, 2].map((image) => (
            <button
              type="button"
              key={image}
              className={galleryImage === image ? styles.activeGalleryThumb : ""}
              onClick={() => setGalleryImage(image)}
              aria-label={`View vehicle image ${image + 1}`}
            >
              <MiniVehicle />
            </button>
          ))}
        </div>
      </section>
      <div className={styles.vehicleDetailLayout}>
        <main>
          <header className={styles.vehicleTitle}>
            <div>
              <small>{vehicle.condition} · Available now</small>
              <h2>
                {vehicle.year} {vehicle.brand} {vehicle.name}
              </h2>
            </div>
            <span>Workshop inspected</span>
          </header>
          <section className={styles.keyFacts}>
            <h3>Key facts</h3>
            <div>
              <article>
                <small>Condition</small>
                <strong>{vehicle.condition}</strong>
                <i>✓</i>
              </article>
              <article>
                <small>{vehicle.condition === "Used" ? "Odometer" : "Engine"}</small>
                <strong>
                  {vehicle.condition === "Used" ? `${vehicle.odometer.toLocaleString()} km` : `${vehicle.engine}cc`}
                </strong>
                <i>✓</i>
              </article>
              <article>
                <small>Warranty</small>
                <strong>{vehicle.condition === "New" ? "Manufacturer warranty" : "Details available"}</strong>
                <i>✓</i>
              </article>
              <article>
                <small>Available</small>
                <strong>Available now</strong>
                <i>✓</i>
              </article>
            </div>
          </section>
          <section className={styles.vehicleSpecifications}>
            <h3>Specifications</h3>
            <dl>
              <div>
                <dt>Year</dt>
                <dd>{vehicle.year}</dd>
              </div>
              <div>
                <dt>Engine size</dt>
                <dd>{vehicle.engine}cc</dd>
              </div>
              <div>
                <dt>Transmission</dt>
                <dd>{vehicle.transmission}</dd>
              </div>
              <div>
                <dt>Condition</dt>
                <dd>{vehicle.condition}</dd>
              </div>
              <div>
                <dt>Fuel</dt>
                <dd>Petrol</dd>
              </div>
              <div>
                <dt>Colour</dt>
                <dd>Midnight blue</dd>
              </div>
            </dl>
          </section>
          <section className={styles.vehicleDescription}>
            <h3>Description</h3>
            <p>
              A beautifully prepared {vehicle.brand} {vehicle.name}, combining everyday usability with confident
              performance. Every detail has been checked by our workshop team and the vehicle is ready for its next
              owner.
            </p>
            <p>Contact us to arrange a viewing, ask a question or complete the next steps online.</p>
          </section>
        </main>
        <aside className={styles.vehicleBuyBox}>
          <small>Drive away</small>
          <strong className={styles.detailPrice}>${vehicle.price.toLocaleString()}</strong>
          {inventoryAddons.purchase ? (
            <section>
              <div className={styles.reserveHeading}>
                <strong>Reserve this vehicle</strong>
                <span>Refundable deposit</span>
              </div>
              <p>Your $250 deposit secures the vehicle while we arrange the remaining steps.</p>
              <ConversionButton className={styles.reserveButton}>Reserve now — $250</ConversionButton>
              <ConversionButton className={styles.buyOutrightButton}>
                Or buy outright — ${vehicle.price.toLocaleString()}
              </ConversionButton>
            </section>
          ) : (
            <p className={styles.purchaseUnavailable}>
              Online purchasing can be added to let customers reserve or purchase directly from this page.
            </p>
          )}
          {(inventoryAddons.contract || inventoryAddons.licensing) && (
            <div className={styles.digitalFeatures}>
              {inventoryAddons.contract && <span>✓ Complete the sales contract online</span>}
              {inventoryAddons.licensing && <span>✓ Complete licensing paperwork online</span>}
            </div>
          )}
          <div className={styles.enquiryDivider}>
            <span>OR</span>
          </div>
          <form
            className={styles.vehicleInterest}
            onSubmit={(event) => {
              event.preventDefault();
              if (interestEmail.trim()) setInterestSent(true);
            }}
          >
            <strong>Want to see it first, or have questions?</strong>
            <p>
              {interestSent
                ? `Thanks — we'll contact you at ${interestEmail}.`
                : "Leave your email and we'll be in touch. No obligation."}
            </p>
            <input
              type="email"
              required
              value={interestEmail}
              onChange={(event) => {
                setInterestEmail(event.target.value);
                setInterestSent(false);
              }}
              aria-label="Email address"
              placeholder="you@example.com"
            />
            <ConversionButton type="submit">Register interest</ConversionButton>
          </form>
        </aside>
      </div>
      {showOnlineSteps && (
        <div className={styles.detailPurchaseFlow}>
          <h2>Ready to buy? Here&apos;s how it works.</h2>
          <p>Reserve it online, complete the paperwork from home and choose delivery or collection.</p>
          <OnlinePurchaseSteps />
        </div>
      )}
    </div>
  );
}
