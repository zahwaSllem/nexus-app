import { Sidebar } from "@/components/layout/Sidebar";
import { StoreProvider } from "@/lib/providers/store-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
        <Sidebar variant="dashboard" />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </StoreProvider>
  );
}
