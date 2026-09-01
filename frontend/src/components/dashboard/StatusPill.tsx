const labels: Record<string, string> = {
  new: "New", contacted: "Contacted", qualified: "Qualified", won: "Won", closed: "Closed", spam: "Spam",
  pending: "Pending", sent: "Sent", failed: "Failed",
  active: "Active", suspended: "Suspended", denied: "Denied",
};

export function StatusPill({ status }: { status: string }) {
  return <span className={`admin-status admin-status-${status}`}>{labels[status] ?? status}</span>;
}

export const enquiryStatuses = ["new", "contacted", "qualified", "won", "closed", "spam"];
export const dealerStatuses = ["pending", "active", "suspended", "denied"];
