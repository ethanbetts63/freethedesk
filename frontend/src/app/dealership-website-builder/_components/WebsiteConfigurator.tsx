'use client';

import { useState } from 'react';

import { ConfiguratorControls } from './ConfiguratorControls';
import {
  DEFAULT_INVENTORY_ADDONS,
  DEFAULT_MODULES,
  summariseSelection,
} from '../_lib/configuratorData';
import type {
  InventoryAddonSelection,
  InventoryOption,
  ModuleKey,
  ModuleSelection,
  PreviewPage,
} from '../_lib/types';
import { WebsitePreview } from './WebsitePreview';

export function WebsiteConfigurator() {
  const [brandName, setBrandName] = useState('Northline');
  const [currentUrl, setCurrentUrl] = useState('');
  const [customRequest, setCustomRequest] = useState('');
  const [previewPage, setPreviewPage] = useState<PreviewPage>('home');
  const [inventoryAddons, setInventoryAddons] =
    useState<InventoryAddonSelection>(DEFAULT_INVENTORY_ADDONS);
  const [selected, setSelected] = useState<ModuleSelection>(DEFAULT_MODULES);

  const { additionCount } = summariseSelection(selected, inventoryAddons, customRequest);

  const toggleModule = (key: ModuleKey) => {
    const willSelect = !selected[key];
    setSelected((current) => ({ ...current, [key]: willSelect }));

    if (key === 'inventory' && !willSelect) {
      setInventoryAddons(DEFAULT_INVENTORY_ADDONS);
    }
    if (key !== 'seo' && key !== 'integrations') {
      setPreviewPage(willSelect ? key : 'home');
    }
  };

  const toggleInventoryAddon = (key: InventoryOption) => {
    setInventoryAddons((current) => ({ ...current, [key]: !current[key] }));
    setPreviewPage('inventory');
  };

  return (
    // The header is 68px on a phone and 78px from lg; the builder fills what
    // is left of the viewport and scrolls its two columns independently.
    <main className="min-h-[calc(100svh-68px)] bg-surface-tint text-text-primary lg:h-[calc(100vh-78px)] lg:min-h-0 lg:overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)] lg:h-full lg:grid-cols-[minmax(0,1.6fr)_minmax(390px,0.7fr)] lg:overflow-hidden">
        <WebsitePreview
          brandName={brandName}
          currentUrl={currentUrl}
          selected={selected}
          inventoryAddons={inventoryAddons}
          previewPage={previewPage}
          additionCount={additionCount}
          onPageChange={setPreviewPage}
        />
        <ConfiguratorControls
          brandName={brandName}
          currentUrl={currentUrl}
          customRequest={customRequest}
          selected={selected}
          inventoryAddons={inventoryAddons}
          onBrandNameChange={setBrandName}
          onCurrentUrlChange={setCurrentUrl}
          onCustomRequestChange={setCustomRequest}
          onModuleToggle={toggleModule}
          onInventoryAddonToggle={toggleInventoryAddon}
        />
      </div>
    </main>
  );
}
