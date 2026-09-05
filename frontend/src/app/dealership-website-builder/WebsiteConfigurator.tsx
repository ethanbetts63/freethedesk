"use client";

import { useState } from "react";

import { ConfiguratorControls } from "./ConfiguratorControls";
import { DEFAULT_INVENTORY_ADDONS, DEFAULT_MODULES, INVENTORY_OPTIONS, MODULES } from "./configuratorData";
import styles from "./page.module.css";
import type { Accent, InventoryAddonSelection, InventoryOption, ModuleKey, ModuleSelection, PreviewPage } from "./types";
import { WebsitePreview } from "./WebsitePreview";

export function WebsiteConfigurator() {
  const [accent, setAccent] = useState<Accent>("blue");
  const [brandName, setBrandName] = useState("Northline");
  const [currentUrl, setCurrentUrl] = useState("");
  const [customRequest, setCustomRequest] = useState("");
  const [previewPage, setPreviewPage] = useState<PreviewPage>("home");
  const [inventoryAddons, setInventoryAddons] = useState<InventoryAddonSelection>(DEFAULT_INVENTORY_ADDONS);
  const [selected, setSelected] = useState<ModuleSelection>(DEFAULT_MODULES);

  const selectedModuleCount = MODULES.filter((module) => selected[module.key]).length;
  const inventoryAddonCount = selected.inventory ? INVENTORY_OPTIONS.filter((option) => inventoryAddons[option.key]).length : 0;
  const additionCount = selectedModuleCount + inventoryAddonCount + Number(customRequest.trim().length > 0);

  const toggleModule = (key: ModuleKey) => {
    const willSelect = !selected[key];
    setSelected((current) => ({ ...current, [key]: willSelect }));

    if (key === "inventory" && !willSelect) {
      setInventoryAddons(DEFAULT_INVENTORY_ADDONS);
    }
    if (key !== "seo" && key !== "integrations") {
      setPreviewPage(willSelect ? key : "home");
    }
  };

  const toggleInventoryAddon = (key: InventoryOption) => {
    setInventoryAddons((current) => ({ ...current, [key]: !current[key] }));
    setPreviewPage("inventory");
  };

  return (
    <main className={styles.page}>
      <div className={styles.builder}>
        <WebsitePreview accent={accent} brandName={brandName} currentUrl={currentUrl} selected={selected} inventoryAddons={inventoryAddons} previewPage={previewPage} additionCount={additionCount} onPageChange={setPreviewPage} />
        <ConfiguratorControls accent={accent} brandName={brandName} currentUrl={currentUrl} customRequest={customRequest} selected={selected} inventoryAddons={inventoryAddons} onAccentChange={setAccent} onBrandNameChange={setBrandName} onCurrentUrlChange={setCurrentUrl} onCustomRequestChange={setCustomRequest} onModuleToggle={toggleModule} onInventoryAddonToggle={toggleInventoryAddon} />
      </div>
    </main>
  );
}
