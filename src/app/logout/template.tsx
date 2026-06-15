import { PageTransition } from "@/components/layout/PageTransition";

export default function LogoutTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
