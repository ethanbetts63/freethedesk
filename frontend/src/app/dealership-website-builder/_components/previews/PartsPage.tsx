"use client";

import Image from "next/image";
import { useState } from "react";

import { ConversionButton } from "../ConversionButton";
import { PageHeading } from "./shared";
import styles from "../../page.module.css";

export function PartsPage() {
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

  const addPart = (number: string) =>
    setAddedParts((current) => (current.includes(number) ? current : [...current, number]));

  return (
    <div className={styles.examplePage}>
      <PageHeading
        eyebrow="Genuine parts lookup"
        title="Cam shaft & cyl. head L. side cover"
        detail="CROX50 · 11 parts"
      />
      <div className={styles.partsSelectors}>
        <label>
          <span>Year</span>
          <select defaultValue="2015">
            <option>2015</option>
            <option>2014</option>
          </select>
        </label>
        <label>
          <span>Make</span>
          <select defaultValue="SYM">
            <option>SYM</option>
          </select>
        </label>
        <label>
          <span>Model</span>
          <select defaultValue="CROX50">
            <option>CROX50</option>
            <option>Orbit 50</option>
          </select>
        </label>
        <label>
          <span>Diagram</span>
          <select defaultValue="E03">
            <option>E03</option>
            <option>E02</option>
            <option>E04</option>
          </select>
        </label>
      </div>
      <div className={styles.partsWorkspace}>
        <figure className={styles.partsDiagram}>
          <figcaption>
            <strong>E03</strong>
            <span>Match the number in the diagram to the parts list.</span>
          </figcaption>
          <Image
            className={styles.diagramImage}
            src="/images/parts-exploded-diagram.webp"
            alt="Cam shaft and cylinder head left side cover exploded diagram with 11 numbered callouts"
            width={617}
            height={382}
          />
        </figure>
        <aside className={styles.partsList}>
          <div className={styles.partsListHeader}>
            <div>
              <strong>Select your parts</strong>
              <small>Numbers correspond to the diagram</small>
            </div>
            <span>{addedParts.length} added</span>
          </div>
          <ol>
            {diagramParts.map((part) => {
              const isAdded = addedParts.includes(part.number);
              const isAvailable = Boolean(part.price);

              return (
                <li key={part.number} className={isAdded ? styles.partAdded : ""}>
                  <span className={styles.partCallout}>{part.number}</span>
                  <div>
                    <strong>{part.name}</strong>
                    <small
                      className={
                        part.status === "In stock"
                          ? styles.inStock
                          : part.status === "Low stock" || part.status === "Backorder"
                            ? styles.limitedStock
                            : ""
                      }
                    >
                      {part.status}
                    </small>
                  </div>
                  <b>{part.price || "—"}</b>
                  <ConversionButton disabled={!isAvailable || isAdded} onClick={() => addPart(part.number)}>
                    {isAdded ? "Added" : "Add"}
                  </ConversionButton>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </div>
  );
}
