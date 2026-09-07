export type Accent = "blue" | "navy" | "teal" | "green" | "orange" | "red" | "purple" | "charcoal";
export type PreviewPage = "home" | "inventory" | "vehicle" | "accessories" | "parts" | "service" | "hire" | "articles" | "contact" | "terms";
export type ModuleKey = Exclude<PreviewPage, "home" | "vehicle" | "contact" | "terms"> | "seo" | "integrations";
export type InventoryOption = "purchase" | "contract" | "licensing" | "newsletter";

export type ModuleSelection = Record<ModuleKey, boolean>;
export type InventoryAddonSelection = Record<InventoryOption, boolean>;

export type ModuleDefinition = {
  key: ModuleKey;
  name: string;
  description: string;
  detail: string;
  includes: string[];
};

export type InventoryOptionDefinition = {
  key: InventoryOption;
  name: string;
  description: string;
  detail: string;
  includes: string[];
};
