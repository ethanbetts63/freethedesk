"use client";

import Image from "next/image";
import { useState } from "react";

const tourItems = [
  {
    number: "01",
    label: "Give the brief",
    title: "The order starts as a description, not a product.",
    copy: "Occasion, budget, free-text preferences, delivery date and card message are captured up front. Custom budgets let the customer set the number instead of picking the closest tier.",
    src: "/case-studies/bloomprint/brief-desktop.png",
    alt: "Bloomprint order builder showing budget tiers, custom preferences, delivery date and card message",
    url: "https://www.bloomprint.com.au/",
    linkLabel: "Open the order builder",
  },
  {
    number: "02",
    label: "Recipient and delivery",
    title: "A three-step checkout that carries the brief with it.",
    copy: "Step two collects the sender, the recipient and the delivery address, with a progress bar that keeps a gift order feeling finite. The brief stays attached to the order all the way to the florist.",
    src: "/case-studies/bloomprint/order-desktop.png",
    alt: "Bloomprint checkout step two collecting sender and recipient details",
    url: "https://www.bloomprint.com.au/",
    linkLabel: "Start an order live",
  },
  {
    number: "03",
    label: "The florist side",
    title: "Supply needed its own product, not a contact form.",
    copy: "Florists sign up free through a two-step account flow, then receive fully paid local orders they can accept or decline. Same platform, an entirely different audience and a different promise.",
    src: "/case-studies/bloomprint/florists-desktop.png",
    alt: "Bloomprint florist signup page with account creation form",
    url: "https://www.bloomprint.com.au/florists",
    linkLabel: "Open the florist page",
  },
  {
    number: "04",
    label: "Local landing pages",
    title: "Every city gets a real page, not a swapped-out word.",
    copy: "City pages carry their own copy, delivery information and suburb coverage — then hand the visitor the same order builder as the homepage, already framed around a local florist.",
    src: "/case-studies/bloomprint/city-desktop.png",
    alt: "Bloomprint Perth flower delivery landing page with the order builder",
    url: "https://www.bloomprint.com.au/flower-delivery-perth",
    linkLabel: "Open the Perth page",
  },
];

export function BloomprintTour() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = tourItems[activeIndex];

  return (
    <div className="case-tour">
      <div className="case-tour-controls" role="tablist" aria-label="Bloomprint website tour">
        {tourItems.map((item, index) => (
          <button
            key={item.number}
            className={activeIndex === index ? "active" : undefined}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls="bloom-tour-preview"
            onClick={() => setActiveIndex(index)}
          >
            <span>{item.number}</span>
            <div><small>{item.label}</small><strong>{item.title}</strong>{activeIndex === index && <p>{item.copy}</p>}</div>
            <i>{activeIndex === index ? "—" : "+"}</i>
          </button>
        ))}
      </div>

      <div className="case-tour-preview" id="bloom-tour-preview" role="tabpanel" aria-live="polite">
        <div className="case-browser">
          <div className="case-browser-bar"><i /><i /><i /><span>www.bloomprint.com.au</span></div>
          <Image key={active.src} className="case-tour-image" src={active.src} alt={active.alt} width={1440} height={681} />
        </div>
        <a href={active.url} target="_blank" rel="noreferrer">{active.linkLabel} <span>↗</span></a>
      </div>
    </div>
  );
}
