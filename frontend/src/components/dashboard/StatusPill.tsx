const labels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  closed: "Closed",
  spam: "Spam",
  pending: "Pending",
  queued: "Queued",
  sent: "Sent",
  delivered: "Delivered",
  failed: "Failed",
  bounced: "Bounced",
  cancelled: "Cancelled",
  active: "Active",
  suspended: "Suspended",
  denied: "Denied",
};

export function statusLabel(status: string): string {
  return labels[status] ?? status[0].toUpperCase() + status.slice(1);
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span className="admin-status" data-status={status}>
      {statusLabel(status)}
    </span>
  );
}

export const enquiryStatuses = ["new", "contacted", "qualified", "won", "closed", "spam"] as const;
export const dealerStatuses = ["pending", "active", "suspended", "denied"] as const;
export const messageStatuses = [
  "queued",
  "sent",
  "delivered",
  "failed",
  "bounced",
  "cancelled",
] as const;
