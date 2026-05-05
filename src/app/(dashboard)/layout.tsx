import { DashboardGate } from "@/ui/layouts/DashboardGate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardGate>{children}</DashboardGate>;
}
