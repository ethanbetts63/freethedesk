import { DealerShell } from "@/components/dashboard/DealerShell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <DealerShell>{children}</DealerShell>;
}
