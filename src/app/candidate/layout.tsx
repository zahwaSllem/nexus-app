import { CandidateSidebar } from "@/components/layout/CandidateSidebar";
import { HeaderBar } from "@/components/layout/HeaderBar";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <CandidateSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <HeaderBar role="candidate" />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
