import type { Metadata } from "next";

import { PortfolioCaseStudy, type PortfolioCaseStudyConfig } from "@/app/portfolio/_components/PortfolioCaseStudy";
import { PORTFOLIO_FAQS } from "@/app/portfolio/_lib/copy";
import { metadataFor } from "@/lib/pages";

export const metadata: Metadata = metadataFor("/portfolio/bloomprint");

const config = {
  path: "/portfolio/bloomprint",
  hero: {
    eyebrow: "Bloomprint case study",
    title: { lines: ["Not a catalogue.", "A brief."], accentLine: 1 },
    description:
      "A national flower delivery marketplace where the customer describes what they want and an independent local florist designs it. Customer ordering, florist supply and organic growth built as one product.",
    liveHref: "https://www.bloomprint.com.au/",
    browserUrl: "www.bloomprint.com.au",
    desktopImage: {
      src: "/case-studies/bloomprint/home-desktop.png",
      alt: "Bloomprint homepage with the order builder open",
      width: 1440,
      height: 681,
    },
    mobileImage: {
      src: "/case-studies/bloomprint/home-desktop.png",
      alt: "Bloomprint homepage and order builder shown at mobile size",
      width: 1440,
      height: 681,
      className: "case-phone-image-cover case-phone-image-bloom",
    },
    liveLabel: "Live marketplace",
    capabilities: ["Strategy", "Design", "Development", "SEO"],
  },
  proof: {
    id: "build",
    stats: [
      {
        value: "02",
        label: "Sides of a marketplace",
        description: "Customer ordering and florist supply designed as one system.",
      },
      {
        value: "06",
        label: "Delivery cities live",
        description: "Perth, Sydney, Melbourne, Brisbane, Adelaide and Hobart.",
      },
      {
        value: "20+",
        label: "Pages built to be found",
        description: "City, occasion, subscription and guide pages feeding one order engine.",
      },
    ],
  },
  intro: {
    eyebrow: "The brief",
    title: { lines: ["Sell a brief,", "not a bouquet photo."] },
    paragraphs: [
      "Online flower delivery usually means scrolling near-identical warehouse bouquets and hoping the photo resembles what turns up. Bloomprint works the other way around: the customer sets the occasion, the budget and their preferences, and an independent florist near the recipient designs to that brief from what is fresh that day.",
      "That is a harder website. It needs an ordering experience that captures intent instead of a product ID, a supply-side product that convinces working florists to sign up, and enough of a search presence to sell a name nobody is looking up yet.",
    ],
    capabilities: [
      "Brief builder",
      "Custom budgets",
      "Checkout",
      "Delivery scheduling",
      "Florist onboarding",
      "Order routing",
      "Subscriptions",
      "Landing pages",
    ],
  },
  tour: {
    eyebrow: "The experience",
    title: { lines: ["Four journeys,", "one order engine."] },
    label: "Bloomprint website tour",
    browserUrl: "www.bloomprint.com.au",
    items: [
      {
        number: "01",
        label: "Give the brief",
        title: "The order starts as a description, not a product.",
        copy: "Occasion, budget, free-text preferences, delivery date and card message are captured up front. Custom budgets let the customer set the number instead of picking the closest tier.",
        src: "/case-studies/bloomprint/brief-desktop.png",
        alt: "Bloomprint order builder showing budget tiers, custom preferences, delivery date and card message",
        width: 1440,
        height: 681,
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
        width: 1440,
        height: 681,
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
        width: 1440,
        height: 681,
        url: "https://www.bloomprint.com.au/florists",
        linkLabel: "Open the florist page",
      },
      {
        number: "04",
        label: "Local landing pages",
        title: "Every city gets a real page, not a swapped-out word.",
        copy: "City pages carry their own copy, delivery information and suburb coverage—then hand the visitor the same order builder as the homepage, already framed around a local florist.",
        src: "/case-studies/bloomprint/city-desktop.png",
        alt: "Bloomprint Perth flower delivery landing page with the order builder",
        width: 1440,
        height: 681,
        url: "https://www.bloomprint.com.au/flower-delivery-perth",
        linkLabel: "Open the Perth page",
      },
    ],
  },
  mobile: {
    eyebrow: "Every screen",
    title: "Mobile First.",
    description:
      "Flower orders often begin on a phone, so the brief, budget, delivery details and payment path were designed for the smallest screen first. The mobile journey is the product—not a compressed desktop checkout.",
    stat: {
      value: "03",
      label: "steps from brief to payment",
      description: "One continuous mobile journey with the customer’s choices carried forward.",
    },
    image: {
      src: "/case-studies/bloomprint/brief-desktop.png",
      alt: "Bloomprint order brief shown in a mobile frame",
      width: 1440,
      height: 681,
      className: "case-phone-image-cover case-phone-image-bloom",
    },
    callout: "Brief stays attached",
  },
  feature: {
    variant: "dual-steps",
    eyebrow: "Both sides",
    title: { lines: ["A marketplace only", "works twice."] },
    description:
      "A customer journey that ends in a beautiful order is worthless if no florist wants to make it. Both sides were designed together, so what the customer is asked for is exactly what the florist needs to start work.",
    columns: [
      {
        label: "Demand",
        title: "The customer",
        description: "Describes the outcome and pays once—no catalogue, no surprises at checkout.",
        steps: [
          { number: "01", detail: "Choose an occasion and the feeling behind it." },
          { number: "02", detail: "Set the budget—a tier, or any custom amount from $65." },
          { number: "03", detail: "Add favourite colours, dislikes, allergies and special requests." },
          { number: "04", detail: "Pick the delivery date and write the card message." },
          { number: "05", detail: "Pay once. Delivery is included over $100." },
        ],
      },
      {
        label: "Supply",
        title: "The florist",
        description: "Gets paid work near the shop with the creative freedom to design it properly.",
        steps: [
          { number: "01", detail: "Join free with a two-step store account." },
          { number: "02", detail: "Receive fully paid local orders near the store." },
          { number: "03", detail: "Take the ones that suit the week's stock and diary." },
          { number: "04", detail: "Design from what is fresh instead of a fixed recipe." },
          { number: "05", detail: "Deliver under the store's own name and brand." },
        ],
      },
    ],
  },
  mediaFeatures: [
    {
      eyebrow: "Pricing as a product decision",
      title: "The budget is set before anything is designed.",
      description:
        "Most flower sites reveal the real price at checkout. Here the customer names the amount—a tier or any custom figure—and that is what they pay, with delivery included over $100. It removes the biggest reason gift buyers abandon an order, and it gives the florist a firm number to design against.",
      points: [
        "Customer-set budgets",
        "Delivery included over $100",
        "No checkout markup",
        "A firm brief for the florist",
      ],
      browserUrl: "www.bloomprint.com.au/pricing",
      image: {
        src: "/case-studies/bloomprint/pricing-desktop.png",
        alt: "Bloomprint pricing page explaining budget-led ordering",
        width: 1440,
        height: 681,
      },
    },
    {
      eyebrow: "Built to be found",
      title: "A new brand needs pages people are already searching for.",
      description:
        "Nobody searches for a marketplace that launched last month. They search for flower delivery in their city, for a subscription, for Mother’s Day, or for a comparison of who is actually any good. The content and landing page structure was built around those searches from the first sprint, not bolted on later.",
      points: ["City landing pages", "Occasion pages", "Comparison guides", "Internal linking"],
      browserUrl: "www.bloomprint.com.au/articles",
      image: {
        src: "/case-studies/bloomprint/guides-desktop.png",
        alt: "Bloomprint guides and articles index",
        width: 1440,
        height: 681,
      },
      reverse: true,
      tinted: true,
    },
  ],
  intent: {
    eyebrow: "Front doors",
    title: { lines: ["Many ways in.", "One way to order."] },
    description:
      "Each page speaks to a different search, then hands the visitor the same order builder—already framed around their city, their occasion or the way they want flowers to arrive. New front doors can be added without rebuilding the thing behind them.",
    groups: [
      {
        number: "01",
        title: "Cities",
        pages: [
          "Flower Delivery Perth",
          "Flower Delivery Sydney",
          "Flower Delivery Melbourne",
          "Flower Delivery Brisbane",
          "Flower Delivery Adelaide",
          "Flower Delivery Hobart",
        ],
      },
      {
        number: "02",
        title: "Occasions",
        pages: ["Birthday Flowers", "Valentine's Day Flowers", "Mother's Day Flowers", "Send Flowers from Overseas"],
      },
      {
        number: "03",
        title: "Recurring & business",
        pages: ["Flower Subscription", "Corporate Flower Subscriptions", "Pricing", "For Florists", "Affiliates"],
      },
      {
        number: "04",
        title: "Guides",
        pages: [
          "Best Flower Subscriptions Australia",
          "Best Flower Delivery Perth",
          "Best Flower Delivery Sydney",
          "Best Flower Delivery Melbourne",
          "All Articles",
        ],
      },
    ],
  },
  seo: {
    eyebrow: "SEO growth",
    title: "3 months.",
    accentTitle: "68% growth.",
    description:
      "Organic clicks grew 68% in three months. City, occasion and guide pages gave a new brand more ways to meet customers already searching for flower delivery.",
  },
  faq: { eyebrow: "Common questions", items: PORTFOLIO_FAQS },
} satisfies PortfolioCaseStudyConfig;

export default function BloomprintCaseStudy() {
  return <PortfolioCaseStudy config={config} />;
}
