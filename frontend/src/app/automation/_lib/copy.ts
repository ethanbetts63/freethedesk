import type { FaqItem } from "@/components/Faq";

export const AUTOMATION_FAQS: FaqItem[] = [
  {
    question: "What counts as something worth automating?",
    answer:
      "Anything copied, chased or checked by hand every week—re-entering data between systems, manual status updates, or repeated follow-ups.",
  },

  {
    question: "Will this replace the software we already use?",
    answer:
      "We start with the accounting, CRM, inventory or job-management systems you already run and add the missing workflow or integration. Sometimes, it makes sense to replace your subscriptions whilst we are going if the cost of developing the feature is less than what you pay for the subscription.",
  },

  {
    question: "How do we know it's actually working?",
    answer: "Every workflow launches with monitoring and documentation, so what it saves is measured, not assumed.",
  },

  {
    question: "How do we get started?",
    answer:
      "Describe the process in plain English—we'll help you work out whether it's worth automating before any development begins.",
  },
];
