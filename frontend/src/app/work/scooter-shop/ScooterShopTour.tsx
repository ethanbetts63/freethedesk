"use client";

import Image from "next/image";
import { useState } from "react";

const tourItems = [
  {
    number: "01",
    label: "Find the right machine",
    title: "Inventory that helps people decide.",
    copy: "Strong category pages, useful filters, stock alerts and a simple three-step buying explanation turn a changing feed into a proper sales experience.",
    src: "/case-studies/scooter-shop/inventory-desktop.png",
    alt: "Used motorcycle inventory with buying steps, stock alert and filters",
    url: "https://www.scootershop.com.au/inventory/motorcycles/used",
  },
  {
    number: "02",
    label: "Move toward sold",
    title: "The detail page carries the sale forward.",
    copy: "Real photography, key facts and price sit beside the next action. Customers can reserve, buy outright or register interest without searching for a way to continue.",
    src: "/case-studies/scooter-shop/vehicle-desktop.png",
    alt: "Ducati vehicle detail page with photography, price and reserve option",
    url: "https://www.scootershop.com.au/inventory/motorcycles/2013-ducati-streetfighter-848-41",
  },
  {
    number: "03",
    label: "Book the workshop",
    title: "Service becomes a usable online journey.",
    copy: "Customers choose a date, time and job type in a focused three-step booking flow. The dealership receives useful information before the motorcycle reaches the workshop.",
    src: "/case-studies/scooter-shop/service-desktop.png",
    alt: "Online motorcycle service booking form",
    url: "https://www.scootershop.com.au/service",
  },
  {
    number: "04",
    label: "Find an exact part",
    title: "A technical catalogue people can understand.",
    copy: "Customers move from model to diagram, match the numbered component and add the correct item from the adjacent list. A specialist counter process becomes available online.",
    src: "/case-studies/scooter-shop/parts-desktop.png",
    alt: "SYM visual parts catalogue with exploded diagram and matching parts list",
    url: "https://www.scootershop.com.au/parts/new/sym/crox50-ae05w6-ru/e03-cam-shaft-cyl-head-l-side-cover",
  },
];

export function ScooterShopTour() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = tourItems[activeIndex];

  return (
    <div className="case-tour">
      <div className="case-tour-controls" role="tablist" aria-label="Scooter Shop website tour">
        {tourItems.map((item, index) => (
          <button
            key={item.number}
            className={activeIndex === index ? "active" : undefined}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls="case-tour-preview"
            onClick={() => setActiveIndex(index)}
          >
            <span>{item.number}</span>
            <div><small>{item.label}</small><strong>{item.title}</strong>{activeIndex === index && <p>{item.copy}</p>}</div>
            <i>{activeIndex === index ? "—" : "+"}</i>
          </button>
        ))}
      </div>

      <div className="case-tour-preview" id="case-tour-preview" role="tabpanel" aria-live="polite">
        <div className="case-browser">
          <div className="case-browser-bar"><i /><i /><i /><span>www.scootershop.com.au</span></div>
          <Image key={active.src} className="case-tour-image" src={active.src} alt={active.alt} width={1440} height={960} />
        </div>
        <a href={active.url} target="_blank" rel="noreferrer">Open this page live <span>↗</span></a>
      </div>
    </div>
  );
}
