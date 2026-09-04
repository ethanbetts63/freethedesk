"use client";

import Link from "next/link";
import { useState } from "react";

import { CapabilityIcon } from "./CapabilityIcon";
import { ACCENTS, INVENTORY_OPTIONS, MODULES } from "./configuratorData";
import styles from "./page.module.css";
import type { Accent, InventoryAddonSelection, InventoryOption, ModuleKey, ModuleSelection } from "./types";

type ConfiguratorControlsProps = {
  accent: Accent;
  brandName: string;
  currentUrl: string;
  customRequest: string;
  selected: ModuleSelection;
  inventoryAddons: InventoryAddonSelection;
  onAccentChange: (accent: Accent) => void;
  onBrandNameChange: (name: string) => void;
  onCurrentUrlChange: (url: string) => void;
  onCustomRequestChange: (request: string) => void;
  onModuleToggle: (key: ModuleKey) => void;
  onInventoryAddonToggle: (key: InventoryOption) => void;
};

export function ConfiguratorControls(props: ConfiguratorControlsProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { accent, brandName, currentUrl, customRequest, selected, inventoryAddons, onAccentChange, onBrandNameChange, onCurrentUrlChange, onCustomRequestChange, onModuleToggle, onInventoryAddonToggle } = props;
  const selectedModules = MODULES.filter((module) => selected[module.key]);
  const selectedInventoryAddons = selected.inventory ? INVENTORY_OPTIONS.filter((option) => inventoryAddons[option.key]) : [];
  const hasCustomRequest = customRequest.trim().length > 0;
  const additionCount = selectedModules.length + selectedInventoryAddons.length + Number(hasCustomRequest);
  const summaryItems = [...selectedModules.map((item) => item.name), ...selectedInventoryAddons.map((item) => item.name), ...(hasCustomRequest ? ["Custom capability"] : [])];
  const toggleExpanded = (key: string) => setExpanded((current) => ({ ...current, [key]: !current[key] }));

  return (
    <aside className={styles.controls} aria-label="Website configuration options">
      <section className={styles.baseProduct}>
        <div><span>Base product</span><b>Included</b></div>
        <h2>Digital Dealer Demo</h2>
        <p>Custom design, core pages, mobile experience, conversion essentials, analytics and technical SEO.</p>
      </section>

      <section className={styles.controlGroup}>
        <div className={styles.groupTitle}><span>01</span><div><strong>Basic Appearance</strong><small>Make the foundation feel like yours.</small></div></div>
        <label htmlFor="brand-name">Brand name</label>
        <input id="brand-name" className={styles.brandInput} value={brandName} onChange={(event) => onBrandNameChange(event.target.value)} maxLength={28} placeholder="Your dealership" />
        <label htmlFor="current-url">Current website <span className={styles.optionalLabel}>Optional</span></label>
        <input id="current-url" className={styles.brandInput} type="text" inputMode="url" value={currentUrl} onChange={(event) => onCurrentUrlChange(event.target.value)} placeholder="www.scootershop.com.au" />
        <small className={styles.fieldNote}>Helps us understand your current content and setup.</small>
        <label>Brand accent</label>
        <div className={styles.swatches}>
          {(Object.keys(ACCENTS) as Accent[]).map((option) => <button key={option} className={accent === option ? styles.activeSwatch : ""} onClick={() => onAccentChange(option)} aria-label={`${option} brand accent`} aria-pressed={accent === option}><i style={{ background: ACCENTS[option] }} /></button>)}
        </div>
        <p className={styles.paletteNote}>Demo palette — production design and colours are tailored to your brand.</p>
      </section>

      <section className={styles.controlGroup}>
        <div className={styles.groupTitle}><span>02</span><div><strong>Add capability</strong><small>Every choice changes the live preview.</small></div></div>
        <div className={styles.moduleOptions}>
          {MODULES.map((module) => {
            const explanationId = `module-${module.key}`;

            return (
            <div key={module.key} className={styles.moduleChoice}>
              <div className={styles.moduleRow}>
                <button className={`${styles.moduleToggle} ${selected[module.key] ? styles.moduleSelected : ""}`} onClick={() => onModuleToggle(module.key)} aria-pressed={selected[module.key]}><span className={styles.capabilityLabel}><span className={styles.capabilityIcon}><CapabilityIcon type={module.key} /></span><span><strong>{module.name}</strong><small>{module.description}</small></span></span><i>{selected[module.key] ? "✓" : "+"}</i></button>
                <button className={`${styles.expandToggle} ${expanded[explanationId] ? styles.expandToggleOpen : ""}`} onClick={() => toggleExpanded(explanationId)} aria-expanded={Boolean(expanded[explanationId])} aria-controls={`${explanationId}-details`} aria-label={`${expanded[explanationId] ? "Hide" : "Learn more about"} ${module.name}`}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5" /></svg></button>
              </div>
              {expanded[explanationId] && <div className={styles.moduleExplanation} id={`${explanationId}-details`}><p>{module.detail}</p><ul>{module.includes.map((item) => <li key={item}>{item}</li>)}</ul></div>}
              {module.key === "inventory" && selected.inventory && (
                <div className={styles.inventorySubOptions}>
                  <p>Optional online actions</p>
                  {INVENTORY_OPTIONS.map((option) => {
                    const optionExplanationId = `inventory-${option.key}`;

                    return <div className={styles.subOption} key={option.key}>
                      <div className={styles.moduleRow}>
                        <button className={`${styles.moduleToggle} ${inventoryAddons[option.key] ? styles.subOptionSelected : ""}`} onClick={() => onInventoryAddonToggle(option.key)} aria-pressed={inventoryAddons[option.key]}><span className={styles.capabilityLabel}><span className={`${styles.capabilityIcon} ${styles.subCapabilityIcon}`}><CapabilityIcon type={option.key} /></span><span><strong>{option.name}</strong><small>{option.description}</small></span></span><i>{inventoryAddons[option.key] ? "✓" : "+"}</i></button>
                        <button className={`${styles.expandToggle} ${expanded[optionExplanationId] ? styles.expandToggleOpen : ""}`} onClick={() => toggleExpanded(optionExplanationId)} aria-expanded={Boolean(expanded[optionExplanationId])} aria-controls={`${optionExplanationId}-details`} aria-label={`${expanded[optionExplanationId] ? "Hide" : "Learn more about"} ${option.name}`}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5" /></svg></button>
                      </div>
                      {expanded[optionExplanationId] && <div className={`${styles.moduleExplanation} ${styles.subExplanation}`} id={`${optionExplanationId}-details`}><p>{option.detail}</p><ul>{option.includes.map((item) => <li key={item}>{item}</li>)}</ul></div>}
                    </div>;
                  })}
                </div>
              )}
            </div>
          );})}
          <div className={styles.moduleChoice}>
            <div className={styles.moduleRow}>
              <button className={`${styles.moduleToggle} ${hasCustomRequest ? styles.moduleSelected : ""}`} onClick={() => setExpanded((current) => ({ ...current, custom: !current.custom }))} aria-expanded={Boolean(expanded.custom)} aria-controls="custom-capability-details">
                <span className={styles.capabilityLabel}>
                  <span className={styles.capabilityIcon}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" /></svg></span>
                  <span><strong>Custom capability</strong><small>Tell us what would make this work for you.</small></span>
                </span>
                <i>{hasCustomRequest ? "✓" : "+"}</i>
              </button>
              <button className={`${styles.expandToggle} ${expanded.custom ? styles.expandToggleOpen : ""}`} onClick={() => toggleExpanded("custom")} aria-expanded={Boolean(expanded.custom)} aria-controls="custom-capability-details" aria-label={`${expanded.custom ? "Hide" : "Open"} custom capability request`}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5" /></svg></button>
            </div>
            {expanded.custom && <div className={styles.customRequestPanel} id="custom-capability-details"><label htmlFor="custom-request">What would you like your website to do?</label><textarea id="custom-request" value={customRequest} onChange={(event) => onCustomRequestChange(event.target.value)} placeholder="For example: connect to our existing workshop system, show stock shared across two locations, or build a trade-in valuation flow..." rows={5} /><small>It can be rough—we’ll help turn the idea into a clear scope.</small></div>}
          </div>
        </div>
      </section>

      <section className={styles.summary}>
        <div><span>Your configuration</span><strong>{additionCount === 0 ? "Base website" : `Base + ${additionCount}`}</strong></div>
        {summaryItems.length > 0 && <p>{summaryItems.join(" · ")}</p>}
        <Link href="/contact">Get a tailored proposal <span>→</span></Link>
        <small>No payment today. We’ll confirm integrations, scope and timing with you first.</small>
      </section>
    </aside>
  );
}
