import type { Metadata } from "next";

import { PortfolioCaseStudy, type PortfolioCaseStudyConfig } from "@/app/portfolio/_components/PortfolioCaseStudy";
import { PORTFOLIO_FAQS } from "@/app/portfolio/_lib/copy";
import { metadataFor } from "@/lib/pages";

export const metadata: Metadata = metadataFor("/portfolio/scooter-shop");

const config = {
  path: "/portfolio/scooter-shop",
  process: {
    label: "What this case study covers",
    steps: [
      { label: "The brief", description: "The dealership problem to solve", href: "#overview" },
      { label: "Customer journeys", description: "Sales, service, parts and hire", href: "#tour" },
      { label: "Dealership operations", description: "The system behind the website", href: "#operations" },
      { label: "Search growth", description: "How more customers found it", href: "#seo-growth" },
    ],
  },
  hero: {
    eyebrow: "Scooter Shop case study",
    title: { lines: ["One dealership.", "One connected system."], accentLine: 1 },
    description:
      "A working website that brings sales, parts, service, hire and dealership operations into one customer experience.",
    liveHref: "https://www.scootershop.com.au/",
    browserUrl: "www.scootershop.com.au",
    desktopImage: {
      src: "/case-studies/scooter-shop/home-desktop.png",
      alt: "Scooter Shop homepage on desktop",
      width: 1440,
      height: 960,
    },
    mobileImage: {
      src: "/case-studies/scooter-shop/inventory-mobile.png",
      alt: "Scooter Shop used inventory experience on mobile",
      width: 390,
      height: 844,
    },
    liveLabel: "Live dealership website",
    capabilities: ["Strategy", "Design", "Development", "SEO"],
  },
  proof: {
    id: "results",
    stats: [
      { value: "+200%", label: "Organic clicks", description: "Recorded in Google Search Console over 6 months." },
      { value: "08", label: "Connected capabilities", description: "From first search to service after the sale." },
      {
        value: "01",
        label: "Dealership system",
        description: "Customer journeys and daily operations designed together.",
      },
    ],
  },
  intro: {
    eyebrow: "The brief",
    title: { lines: ["Not a brochure.", "A working dealership."] },
    paragraphs: [
      "Scooter Shop needed to represent several very different parts of the business without making the experience feel fragmented. Customers should be able to discover stock, make a decision, buy, find a part or book the workshop without starting again each time.",
    ],
    capabilities: ["Inventory", "Online purchasing", "Licensing", "Parts", "Service bookings", "Hire", "Guides", "SEO"],
    showCta: false,
  },
  tour: {
    eyebrow: "The customer experience",
    title: { lines: ["Built around what", "the customer came to do."] },
    label: "Scooter Shop website tour",
    browserUrl: "www.scootershop.com.au",
    items: [
      {
        number: "01",
        label: "Find the right machine",
        title: "Inventory that helps people decide.",
        copy: "Strong category pages, useful filters, stock alerts and a simple three-step buying explanation turn a changing feed into a proper sales experience.",
        src: "/case-studies/scooter-shop/inventory-desktop.png",
        alt: "Used motorcycle inventory with buying steps, stock alert and filters",
        width: 1440,
        height: 960,
        url: "https://www.scootershop.com.au/inventory/motorcycles/used",
        linkLabel: "Open this page live",
      },
      {
        number: "02",
        label: "Move toward sold",
        title: "The detail page carries the sale forward.",
        copy: "Real photography, key facts and price sit beside the next action. Customers can reserve, buy outright or register interest without searching for a way to continue.",
        src: "/case-studies/scooter-shop/vehicle-desktop.png",
        alt: "Ducati vehicle detail page with photography, price and reserve option",
        width: 1440,
        height: 960,
        url: "https://www.scootershop.com.au/inventory/motorcycles/2013-ducati-streetfighter-848-41",
        linkLabel: "Open this page live",
      },
      {
        number: "03",
        label: "Book the workshop",
        title: "Service becomes a usable online journey.",
        copy: "Customers choose a date, time and job type in a focused three-step booking flow. The dealership receives useful information before the motorcycle reaches the workshop.",
        src: "/case-studies/scooter-shop/service-desktop.png",
        alt: "Online motorcycle service booking form",
        width: 1440,
        height: 960,
        url: "https://www.scootershop.com.au/service",
        linkLabel: "Open this page live",
      },
      {
        number: "04",
        label: "Find an exact part",
        title: "A technical catalogue people can understand.",
        copy: "Customers move from model to diagram, match the numbered component and add the correct item from the adjacent list. A specialist counter process becomes available online.",
        src: "/case-studies/scooter-shop/parts-desktop.png",
        alt: "SYM visual parts catalogue with exploded diagram and matching parts list",
        width: 1440,
        height: 960,
        url: "https://www.scootershop.com.au/parts/new/sym/crox50-ae05w6-ru/e03-cam-shaft-cyl-head-l-side-cover",
        linkLabel: "Open this page live",
      },
    ],
  },
  mobile: {
    eyebrow: "Every screen",
    title: "Designed for the screen customers use.",
    description:
      "For Scooter Shop we found that an average of 66% of users are browsing on mobile. That is why every journey starts with the smallest screen in our process—not as a reduced version of desktop.",
    stat: {
      value: "66%",
      label: "of dealership users are on mobile",
      description: "Average across the Australian dealership traffic we see.",
    },
    image: {
      src: "/case-studies/scooter-shop/inventory-mobile.png",
      alt: "Responsive Scooter Shop inventory page showing the online buying steps",
      width: 390,
      height: 844,
    },
    callout: "Clear buying path",
  },
  feature: {
    variant: "operations",
    eyebrow: "Behind the website",
    title: { lines: ["Dealership operations", "behind the website."] },
    description:
      "The public website is only half the system. The management experience is organised around what dealership staff need to action next, so better customer service does not create more administration.",
    console: {
      workspace: "Dealer workspace",
      navigation: ["Today", "Customers", "Inventory", "Orders", "Service"],
      activeNavigation: "Today",
      activeCount: "8",
      timestamp: "Thursday / 9:41 AM",
      title: "What needs attention.",
      status: "All systems connected",
      items: [
        { number: "01", title: "Action queue", detail: "Enquiries and next steps arrive with the context staff need." },
        {
          number: "02",
          title: "Orders & licensing",
          detail: "Customer paperwork, payment and handover progress stay connected.",
        },
        {
          number: "03",
          title: "Stock & content",
          detail: "The information customers rely on can be managed in one place.",
        },
        {
          number: "04",
          title: "Service diary",
          detail: "Bookings become an organised workshop schedule, not another inbox.",
        },
      ],
    },
  },
  intent: {
    eyebrow: "High-intent pages",
    title: { lines: ["Search pages built", "around customer intent."] },
    description:
      "Different customers reveal different intent in the way they search: a Vespa service, a used motorcycle or a specific SYM part. We build focused pages around those searches to capture more high-intent organic traffic—then give each visitor a more relevant next step.",
    groups: [
      {
        number: "01",
        title: "Ready to buy",
        pages: [
          "New Scooters",
          "Used Scooters",
          "Used Motorcycles",
          "E-Scooters",
          "50cc Scooters Perth",
          "125cc Scooters Perth",
        ],
      },
      {
        number: "02",
        title: "Need the workshop",
        pages: ["Servicing", "Scooter Repairs", "Vespa Service Perth", "Motorcycle Service", "Tyre Fitting"],
      },
      {
        number: "03",
        title: "Brand, parts or hire",
        pages: ["SYM Scooters", "SYM Parts", "Parts Enquiry", "Patrol Mountain Bikes", "Motorcycle Hire Perth"],
      },
      {
        number: "04",
        title: "Local and researching",
        pages: [
          "Motorcycles Perth",
          "Used Vespa Scooters Perth",
          "SYM Scooters Perth",
          "Scooters Morley",
          "Scooters Mount Lawley",
          "Scooter Service North Perth",
          "Car vs Moped Cost Calculator",
        ],
      },
    ],
  },
  seo: {
    eyebrow: "SEO growth",
    title: "200% growth.",
    accentTitle: "6 months.",
    description:
      "Organic clicks grew 300% in six months. Indexable stock, focused landing pages and useful guides created more ways for ready-to-buy customers to find the dealership.",
  },
  faq: { eyebrow: "Common questions", items: PORTFOLIO_FAQS },
} satisfies PortfolioCaseStudyConfig;

export default function ScooterShopCaseStudy() {
  return <PortfolioCaseStudy config={config} />;
}
