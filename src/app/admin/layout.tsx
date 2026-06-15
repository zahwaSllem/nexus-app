import { Sidebar } from "@/components/layout/Sidebar";
import { HeaderBar } from "@/components/layout/HeaderBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Sidebar variant="admin" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <HeaderBar role="admin" />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
