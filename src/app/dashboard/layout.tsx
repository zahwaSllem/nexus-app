import { Sidebar } from "@/components/layout/Sidebar";
import { HeaderBar } from "@/components/layout/HeaderBar";
import { StoreProvider } from "@/lib/providers/store-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
        <Sidebar variant="dashboard" />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <HeaderBar role="dashboard" />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </StoreProvider>
  );
}
