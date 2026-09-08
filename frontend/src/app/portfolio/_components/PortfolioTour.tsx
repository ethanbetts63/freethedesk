"use client";

import Image from "next/image";
import { useId, useState } from "react";

export type PortfolioTourItem = {
  number: string;
  label: string;
  title: string;
  copy: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  url: string;
  linkLabel: string;
};

type PortfolioTourProps = {
  label: string;
  browserUrl: string;
  items: readonly PortfolioTourItem[];
};

export function PortfolioTour({ label, browserUrl, items }: PortfolioTourProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const panelId = `portfolio-tour-${useId().replaceAll(":", "")}`;
  const active = items[activeIndex];

  if (!active) return null;

  return (
    <div className="case-tour">
      <div className="case-tour-controls" role="tablist" aria-label={label}>
        {items.map((item, index) => (
          <button
            key={item.number}
            className={activeIndex === index ? "active" : undefined}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls={panelId}
            onClick={() => setActiveIndex(index)}
          >
            <span>{item.number}</span>
            <div>
              <small>{item.label}</small>
              <strong>{item.title}</strong>
              {activeIndex === index && <p>{item.copy}</p>}
            </div>
            <i>{activeIndex === index ? "—" : "+"}</i>
          </button>
        ))}
      </div>

      <div className="case-tour-preview" id={panelId} role="tabpanel" aria-live="polite">
        <div className="case-browser">
          <div className="case-browser-bar">
            <i />
            <i />
            <i />
            <span>{browserUrl}</span>
          </div>
          <Image
            key={active.src}
            className="case-tour-image"
            src={active.src}
            alt={active.alt}
            width={active.width}
            height={active.height}
          />
        </div>
        <a href={active.url} target="_blank" rel="noreferrer">
          {active.linkLabel} <span>↗</span>
        </a>
      </div>
    </div>
  );
}
