"use client";

import { useState } from "react";

import { ConversionButton } from "../ConversionButton";
import { DemoMap } from "../DemoMap";
import styles from "../../_styles/preview.module.css";

export function ServicePage() {
  const [step, setStep] = useState(1);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("2026-09-18");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [customer, setCustomer] = useState("");
  const [booked, setBooked] = useState(false);
  const serviceOptions = [
    {
      name: "Scheduled service & maintenance",
      description: "Routine servicing, inspections and manufacturer maintenance.",
    },
    { name: "Diagnosis or repair", description: "For a vehicle that will not start, feels different or needs repair." },
    { name: "Tyre fitting", description: "Supply and fit, fit-only replacement or wheel balancing." },
  ];
  const canProceed = Boolean(selectedDate && time && serviceTypes.length);
  const toggleServiceType = (name: string) =>
    setServiceTypes((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );

  return (
    <div className={styles.serviceBookingPage}>
      <section className={styles.serviceBookingHero}>
        <div className={styles.serviceHeroCopy}>
          <small>Workshop servicing</small>
          <h2>
            Get your
            <br />
            bike
            <br />
            <em>sorted.</em>
          </h2>
          <p>
            Experienced servicing and repairs with free online booking. We&apos;ll provide a clear estimate before work
            begins.
          </p>
          <ul>
            <li>
              <i>✓</i> Mechanical servicing and repairs
            </li>
            <li>
              <i>✓</i> Tyre fitting and wheel balancing
            </li>
            <li>
              <i>✓</i> All major makes and models
            </li>
            <li>
              <i>✓</i> Pickup can be arranged
            </li>
          </ul>
        </div>

        <div className={styles.serviceBookingCard}>
          <header>
            <div>
              <h3>Book your service</h3>
              <span>✓ Free to book</span>
            </div>
            <p>
              Step {step} of 3 —{" "}
              {step === 1
                ? "pick a drop-off time and tell us what your vehicle needs."
                : step === 2
                  ? "tell us about your bike."
                  : "check the booking details."}
            </p>
          </header>

          {step === 1 && (
            <div className={styles.serviceBookingFields}>
              <div className={styles.serviceDateTimeFields}>
                <div className={styles.bookingField}>
                  <label htmlFor="service-date">Drop-off date *</label>
                  <input
                    id="service-date"
                    type="date"
                    min="2026-09-10"
                    value={selectedDate}
                    onChange={(event) => {
                      setSelectedDate(event.target.value);
                      setTime("");
                    }}
                    required
                  />
                </div>
                <div className={styles.bookingField}>
                  <label htmlFor="service-time">Drop-off time *</label>
                  <select
                    id="service-time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    disabled={!selectedDate}
                  >
                    <option value="">Select a time</option>
                    {[
                      "08:00",
                      "08:30",
                      "09:00",
                      "09:30",
                      "10:00",
                      "10:30",
                      "11:00",
                      "11:30",
                      "12:00",
                      "12:30",
                      "13:00",
                      "13:30",
                      "14:00",
                      "14:30",
                      "15:00",
                      "15:30",
                    ].map((slot) => (
                      <option key={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.jobTypeField}>
                <strong>Job type *</strong>
                <p>Select one or more services you require.</p>
                <div>
                  {serviceOptions.map((option) => (
                    <label key={option.name}>
                      <input
                        type="checkbox"
                        checked={serviceTypes.includes(option.name)}
                        onChange={() => toggleServiceType(option.name)}
                      />
                      <span>
                        <b>{option.name}</b>
                        <small>{option.description}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <label>
                <span>Notes</span>
                <small className={styles.bookingFieldHelp}>
                  Any details about the issue—sounds, circumstances or specific concerns.
                </small>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add any notes for the mechanic"
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className={styles.serviceBookingFields}>
              <label>
                <span>Your motorcycle or scooter</span>
                <input
                  value={vehicle}
                  onChange={(event) => setVehicle(event.target.value)}
                  placeholder="e.g. 2022 Horizon Touring X"
                />
              </label>
              <label>
                <span>Your name</span>
                <input value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="Full name" />
              </label>
              <label>
                <span>Anything we should know?</span>
                <textarea rows={4} placeholder="Describe a noise, issue or anything you would like checked..." />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className={styles.bookingReview}>
              <small>Booking summary</small>
              <dl>
                <div>
                  <dt>Service</dt>
                  <dd>{serviceTypes.join(", ")}</dd>
                </div>
                <div>
                  <dt>Drop-off</dt>
                  <dd>
                    {selectedDate} · {time}
                  </dd>
                </div>
                <div>
                  <dt>Vehicle</dt>
                  <dd>{vehicle || "Vehicle details at drop-off"}</dd>
                </div>
                <div>
                  <dt>Name</dt>
                  <dd>{customer || "To be confirmed"}</dd>
                </div>
              </dl>
              {notes && (
                <p>
                  <strong>Notes:</strong> {notes}
                </p>
              )}
              <p>No payment is required. The workshop will confirm the booking and provide an estimate.</p>
              {booked && <strong>Thanks—your booking request has been sent.</strong>}
            </div>
          )}

          <footer>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setBooked(false);
                  setStep((current) => current - 1);
                }}
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
            {step === 1 ? (
              <button type="button" disabled={!canProceed} onClick={() => setStep(2)}>
                Next: Vehicle details
              </button>
            ) : step === 2 ? (
              <button type="button" onClick={() => setStep(3)}>
                Review booking →
              </button>
            ) : (
              <ConversionButton onClick={() => setBooked(true)}>Request booking →</ConversionButton>
            )}
          </footer>
        </div>
      </section>

      <section className={styles.serviceReviews}>
        <div>
          <small>Trusted local workshop</small>
          <strong>
            4.9 <span>★★★★★</span>
          </strong>
          <p>Based on 186 verified service customers</p>
        </div>
        <blockquote>
          <span>“</span>
          <p>Easy to book, excellent communication and my vehicle was ready exactly when promised.</p>
          <footer>— Matt R. · Annual service</footer>
        </blockquote>
      </section>
      <section className={styles.serviceWork}>
        <header>
          <small>What we do</small>
          <h3>Workshop support for every kind of ride.</h3>
        </header>
        <div>
          <article>
            <i>01</i>
            <strong>No-start diagnosis &amp; service</strong>
            <p>We trace electrical, fuel or mechanical faults and explain the work before getting started.</p>
          </article>
          <article>
            <i>02</i>
            <strong>Running vehicle diagnosis &amp; service</strong>
            <p>Scheduled maintenance, inspections and repairs to keep your vehicle performing at its best.</p>
          </article>
          <article>
            <i>03</i>
            <strong>Tyre fitting</strong>
            <p>Supply and fit or fit-only tyre changes, replacement and wheel balancing.</p>
          </article>
        </div>
      </section>
      <section className={styles.findUsSection}>
        <div className={styles.findUsCopy}>
          <small>How to find us</small>
          <h3>Visit our service centre.</h3>
          <p>Your workshop address</p>
          <span>
            Mon–Fri 8:00–5:30
            <br />
            Saturday 8:00–1:00
          </span>
          <ConversionButton>Get directions ↗</ConversionButton>
        </div>
        <DemoMap className={styles.serviceMap} ariaLabel="Map showing the service centre at a road intersection" />
      </section>
    </div>
  );
}
