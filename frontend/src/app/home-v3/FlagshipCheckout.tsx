"use client";

import Link from "next/link";
import { useState } from "react";

import styles from "./FlagshipCheckout.module.css";

type PurchaseChoice = "deposit" | "full";
type HandoverChoice = "delivery" | "collection";

export function FlagshipCheckout() {
  const [purchase, setPurchase] = useState<PurchaseChoice>("deposit");
  const [licensing, setLicensing] = useState(true);
  const [handover, setHandover] = useState<HandoverChoice>("delivery");

  const dueToday = purchase === "full" ? "$18,490" : "$500";
  const activeSteps = 1 + Number(licensing) + 1;

  return (
    <section className={styles.section} id="online-purchasing">
      <div className={`shell ${styles.introduction}`}>
        <div>
          <p className={styles.eyebrow}><span /> Flagship product</p>
          <h2>Sell & License.<br /><em>Entirely online.</em></h2>
        </div>
        <div className={styles.introCopy}>
          <p>
            Let customers purchase, complete licensing and arrange delivery from wherever they are—or use only the steps that suit your dealership.
          </p>
          <Link href="/contact">Talk about online sales <span>↗</span></Link>
        </div>
      </div>

      <div className={`shell ${styles.demoShell}`}>
        <div className={styles.demoLabel}>
          <span>Interactive demonstration</span>
          <span>Configure the customer journey</span>
        </div>

        <div className={styles.demo}>
          <div className={styles.productPanel}>
            <div className={styles.browserBar}>
              <div><i /><i /><i /></div>
              <span>yourdealership.com.au</span>
              <b>Secure checkout</b>
            </div>

            <div className={styles.productContent}>
              <div className={styles.productMeta}>
                <span>Available now</span>
                <span>Stock #D1842</span>
              </div>
              <div className={styles.vehicleVisual} aria-hidden="true">
                <span className={styles.vehicleShadow} />
                <span className={styles.vehicleBody} />
                <span className={styles.vehicleCabin} />
                <i className={styles.wheelOne} />
                <i className={styles.wheelTwo} />
              </div>
              <div className={styles.productHeading}>
                <div>
                  <small>2026 Horizon</small>
                  <h3>Touring X</h3>
                </div>
                <strong>$18,490</strong>
              </div>
              <div className={styles.specs}>
                <span><b>12 km</b>Odometer</span>
                <span><b>Automatic</b>Transmission</span>
                <span><b>Blue</b>Colour</span>
              </div>
            </div>
          </div>

          <div className={styles.configPanel}>
            <div className={styles.configHeading}>
              <div>
                <span>Online purchase</span>
                <h3>Make it yours.</h3>
              </div>
              <span className={styles.stepCount}>{activeSteps} steps online</span>
            </div>

            <div className={styles.optionGroup}>
              <div className={styles.optionTitle}><span>01</span><div><strong>Purchase</strong><small>Choose how to secure the vehicle.</small></div></div>
              <div className={styles.segmented}>
                <button className={purchase === "deposit" ? styles.selected : ""} onClick={() => setPurchase("deposit")} aria-pressed={purchase === "deposit"}>
                  <span>Pay deposit</span><b>$500 today</b>
                </button>
                <button className={purchase === "full" ? styles.selected : ""} onClick={() => setPurchase("full")} aria-pressed={purchase === "full"}>
                  <span>Purchase online</span><b>Pay in full</b>
                </button>
              </div>
            </div>

            <div className={styles.optionGroup}>
              <div className={styles.optionTitle}><span>02</span><div><strong>Licensing</strong><small>Complete the paperwork before handover.</small></div></div>
              <button className={`${styles.toggleRow} ${licensing ? styles.toggleActive : ""}`} onClick={() => setLicensing((value) => !value)} aria-pressed={licensing}>
                <span><b>Complete licensing online</b><small>Identity, forms and signatures</small></span>
                <i><span /></i>
              </button>
            </div>

            <div className={styles.optionGroup}>
              <div className={styles.optionTitle}><span>03</span><div><strong>Handover</strong><small>Finish the journey their way.</small></div></div>
              <div className={styles.segmented}>
                <button className={handover === "delivery" ? styles.selected : ""} onClick={() => setHandover("delivery")} aria-pressed={handover === "delivery"}>
                  <span>Arrange delivery</span><b>To their door</b>
                </button>
                <button className={handover === "collection" ? styles.selected : ""} onClick={() => setHandover("collection")} aria-pressed={handover === "collection"}>
                  <span>Book collection</span><b>At the dealership</b>
                </button>
              </div>
            </div>

            <div className={styles.summary}>
              <div><span>Due today</span><strong>{dueToday}</strong></div>
              <button>Continue securely <span>→</span></button>
              <p>{licensing ? "Online licensing included" : "Licensing handled by the dealership"} · {handover === "delivery" ? "Delivery arranged online" : "Collection time selected online"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
