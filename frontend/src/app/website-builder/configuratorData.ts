import type { Accent, InventoryAddonSelection, InventoryOptionDefinition, ModuleDefinition, ModuleSelection } from "./types";

export const ACCENTS: Record<Accent, string> = {
  blue: "#247ec9",
  navy: "#1d4778",
  teal: "#16858f",
  green: "#27836a",
  orange: "#d56f2a",
  red: "#c94b3c",
  purple: "#7657b7",
  charcoal: "#333d47",
};

export const MODULES: ModuleDefinition[] = [
  { key: "inventory", name: "Inventory catalogue", description: "Searchable, sales-ready live stock.", detail: "Turn dealership stock into a fast, easy-to-browse online catalogue that stays useful on every screen.", includes: ["Make, model, price and condition filters", "Detailed vehicle pages and enquiries", "Compatible with online sales options"] },
  { key: "accessories", name: "Accessories catalogue", description: "Sell apparel and useful extras.", detail: "Give customers a dedicated place to discover and purchase accessories, apparel and vehicle-specific extras.", includes: ["Categories, search and product pages", "Vehicle-compatible recommendations", "Cart, stock and delivery options"] },
  { key: "parts", name: "Visual parts catalogue", description: "Model lookup and selectable parts diagrams.", detail: "Help customers identify the correct component by selecting their vehicle and exploring an interactive exploded-parts diagram.", includes: ["Year, make and model lookup", "Clickable numbered diagrams", "Part details and online ordering"] },
  { key: "service", name: "Service bookings", description: "Online bookings and workshop diary.", detail: "Let customers find an available workshop time and book without having to call the dealership.", includes: ["Vehicle and service selection", "Live appointment availability", "Confirmations and reminder workflows"] },
  { key: "hire", name: "Hire and fleet", description: "Availability, reservations and payments.", detail: "Create an additional revenue stream from used stock or a dedicated fleet with a complete online hire journey.", includes: ["Date-based fleet availability", "Rates, deposits and reservations", "Customer details and hire agreements"] },
  { key: "articles", name: "Guides and articles", description: "Publish useful, search-ready content.", detail: "Build authority and organic traffic with useful buying guides, ownership advice and dealership stories.", includes: ["Flexible article templates", "Categories and related content", "Search and social metadata"] },
  { key: "seo", name: "Continuous SEO", description: "Measure, learn and improve over time.", detail: "We apply strong technical foundations at launch, then use real search data to make gradual, evidence-led improvements.", includes: ["Technical and on-page foundations", "Search performance monitoring", "Ongoing content and page improvements"] },
  { key: "integrations", name: "System integrations", description: "Connect stock, CRM and existing tools.", detail: "Connect the website to the systems your dealership already relies on so information moves without double handling.", includes: ["Inventory and DMS connections", "CRM and enquiry routing", "Custom API and workflow support"] },
];

export const INVENTORY_OPTIONS: InventoryOptionDefinition[] = [
  { key: "purchase", name: "Online purchasing", description: "Deposits or full payment from a stock item.", detail: "Customers can move from a vehicle listing into a guided checkout and complete as much of the purchase as your dealership allows.", includes: ["Deposit or full-payment journeys", "Optional delivery or collection", "Secure customer and order records"] },
  { key: "contract", name: "Online sales contract", description: "Complete and sign the vehicle sales contract.", detail: "Move the sales agreement online with a clear, guided process for reviewing details and collecting signatures.", includes: ["Pre-filled customer and vehicle details", "Digital acceptance and signatures", "Completed document records"] },
  { key: "licensing", name: "Online licensing", description: "Identity, licensing forms and signatures online.", detail: "Collect the information and approvals required for licensing without making the customer visit the dealership.", includes: ["Guided identity and licence details", "Required forms and declarations", "Standalone or checkout integration"] },
  { key: "newsletter", name: "New stock newsletter", description: "Capture buyers waiting for the right vehicle.", detail: "Place a simple signup above the inventory list so interested buyers can hear about newly listed vehicles before they miss them.", includes: ["Prominent inventory-page signup", "Customer email capture", "New-stock campaign integration"] },
];

export const DEFAULT_MODULES: ModuleSelection = {
  inventory: false,
  accessories: false,
  parts: false,
  service: false,
  hire: false,
  articles: false,
  seo: false,
  integrations: false,
};

export const DEFAULT_INVENTORY_ADDONS: InventoryAddonSelection = {
  purchase: false,
  contract: false,
  licensing: false,
  newsletter: false,
};
