"use client";

import { useState } from "react";

import { ConversionButton } from "../ConversionButton";
import { MiniVehicle, PageHeading } from "./shared";
import styles from "../../page.module.css";

export function HirePage() {
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
  const hireDays =
    Number.isNaN(pickup.getTime()) || Number.isNaN(dropoff.getTime())
      ? 1
      : Math.max(1, Math.ceil((dropoff.getTime() - pickup.getTime()) / 86400000));
  const hireTotal = (selectedVehicle?.price || 0) * hireDays + (helmet ? 10 * hireDays : 0) + (delivery ? 45 : 0);
  const updateDates = (setter: (value: string) => void, value: string) => {
    setter(value);
    setAvailabilityChecked(false);
  };

  return (
    <div className={styles.examplePage}>
      <PageHeading eyebrow="Online hire" title="Choose a date. Start exploring." detail="3 vehicles available" />
      <form
        className={styles.hireSearch}
        onSubmit={(event) => {
          event.preventDefault();
          setAvailabilityChecked(true);
          setSelectedHire("");
        }}
      >
        <label>
          <span>Pick up</span>
          <input type="date" value={pickupDate} onChange={(event) => updateDates(setPickupDate, event.target.value)} />
        </label>
        <i>→</i>
        <label>
          <span>Return</span>
          <input
            type="date"
            min={pickupDate}
            value={returnDate}
            onChange={(event) => updateDates(setReturnDate, event.target.value)}
          />
        </label>
        <label>
          <span>Vehicle type</span>
          <select
            value={vehicleType}
            onChange={(event) => {
              setVehicleType(event.target.value);
              setSelectedHire("");
            }}
          >
            <option value="all">All vehicles</option>
            <option value="scooter">Scooter</option>
            <option value="adventure">Adventure</option>
            <option value="touring">Touring</option>
          </select>
        </label>
        <button type="submit">Check availability</button>
      </form>

      <div className={styles.hireResults}>
        <div>
          <strong>{availabilityChecked ? `${availableVehicles.length} available` : "Dates changed"}</strong>
          <span>
            {availabilityChecked
              ? `${hireDays} day${hireDays === 1 ? "" : "s"} · unlimited kilometres`
              : "Refresh availability to see updated vehicles."}
          </span>
        </div>
        <b>✓ Insurance included</b>
      </div>
      {availabilityChecked && (
        <div className={styles.hireGrid}>
          {availableVehicles.map((item) => (
            <article key={item.name} className={selectedHire === item.name ? styles.selectedHireCard : ""}>
              <MiniVehicle />
              <small>{item.type}</small>
              <strong>{item.name}</strong>
              <span>{item.detail}</span>
              <p>
                From <b>${item.price}</b> / day
              </p>
              <button type="button" onClick={() => setSelectedHire(item.name)}>
                {selectedHire === item.name ? "Selected" : "Choose vehicle →"}
              </button>
            </article>
          ))}
        </div>
      )}

      {selectedVehicle && availabilityChecked && (
        <section className={styles.hireCheckout}>
          <div className={styles.hireSelection}>
            <small>Your hire</small>
            <strong>{selectedVehicle.name}</strong>
            <span>
              {hireDays} day{hireDays === 1 ? "" : "s"} · {pickupDate} to {returnDate}
            </span>
          </div>
          <div className={styles.hireExtras}>
            <label>
              <input type="checkbox" checked={helmet} onChange={(event) => setHelmet(event.target.checked)} />
              <span>
                <b>Helmet hire</b>
                <small>+$10 / day</small>
              </span>
            </label>
            <label>
              <input type="checkbox" checked={delivery} onChange={(event) => setDelivery(event.target.checked)} />
              <span>
                <b>Deliver to me</b>
                <small>+$45 once</small>
              </span>
            </label>
          </div>
          <div className={styles.hireTotal}>
            <span>Estimated total</span>
            <strong>${hireTotal}</strong>
            <ConversionButton>Reserve online →</ConversionButton>
          </div>
        </section>
      )}
    </div>
  );
}
