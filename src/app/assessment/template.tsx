import { PageTransition } from "@/components/layout/PageTransition";

export default function AssessmentTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
