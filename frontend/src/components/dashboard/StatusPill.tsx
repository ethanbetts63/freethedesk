const labels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  closed: "Closed",
  spam: "Spam",
  pending: "Pending",
  sent: "Sent",
  failed: "Failed",
  active: "Active",
  suspended: "Suspended",
  denied: "Denied",
};

/** Title-cases a status code for a filter option, using the shared label where there is one. */
export function statusLabel(status: string): string {
  return labels[status] ?? status[0].toUpperCase() + status.slice(1);
}

export function StatusPill({ status }: { status: string }) {
  return <span className={`admin-status admin-status-${status}`}>{statusLabel(status)}</span>;
}

export const enquiryStatuses = ["new", "contacted", "qualified", "won", "closed", "spam"] as const;
export const dealerStatuses = ["pending", "active", "suspended", "denied"] as const;
export const messageStatuses = ["sent", "pending", "failed"] as const;
