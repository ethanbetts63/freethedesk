/* Demo stock shown in the dealership website preview. */

export type InventoryVehicle = {
  name: string;
  brand: string;
  condition: "New" | "Used";
  price: number;
  year: number;
  engine: number;
  transmission: string;
  odometer: number;
};

export const INVENTORY_VEHICLES: InventoryVehicle[] = [
  {
    name: "Touring X",
    brand: "Horizon",
    condition: "New",
    price: 8990,
    year: 2026,
    engine: 650,
    transmission: "Manual",
    odometer: 0,
  },
  {
    name: "Urban 400",
    brand: "Axis",
    condition: "Used",
    price: 6240,
    year: 2023,
    engine: 400,
    transmission: "Automatic",
    odometer: 8400,
  },
  {
    name: "Adventure R",
    brand: "Northline",
    condition: "New",
    price: 13490,
    year: 2026,
    engine: 700,
    transmission: "Manual",
    odometer: 0,
  },
  {
    name: "Classic 250",
    brand: "Horizon",
    condition: "Used",
    price: 4990,
    year: 2021,
    engine: 250,
    transmission: "Automatic",
    odometer: 12150,
  },
  {
    name: "Cruiser S",
    brand: "Northline",
    condition: "Used",
    price: 9750,
    year: 2024,
    engine: 500,
    transmission: "Manual",
    odometer: 3950,
  },
  {
    name: "Trail Pro",
    brand: "Axis",
    condition: "New",
    price: 11290,
    year: 2025,
    engine: 550,
    transmission: "Manual",
    odometer: 0,
  },
];
