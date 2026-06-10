import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const governanceGates = [
  { id: "D5-ALL", desc: "Domain 5 fully deferred to Phase 2", status: "Enforced" },
  { id: "D1-IN", desc: "Integrity Orientation — operational_allowed_with_restrictions", status: "Active" },
  { id: "D5-LE", desc: "Leadership Expression — requires multi-method evidence", status: "Enforced" },
  { id: "D5-JDQ", desc: "Judgment & Decision Quality — requires domain-specific validation", status: "Enforced" },
];

const systemLayers = [
  { layer: "L1", name: "Session Orchestration", status: "Online" },
  { layer: "L2", name: "Measurement Engine", status: "Online" },
  { layer: "L3", name: "Response Quality", status: "Online" },
  { layer: "L4", name: "Psychometric Scoring", status: "Placeholder" },
  { layer: "L5", name: "Profile Modeling", status: "Placeholder" },
  { layer: "L6", name: "Contextual Interpretation", status: "Placeholder" },
  { layer: "L7", name: "Governance Engine", status: "Online" },
];

const layerStatusVariants: Record<string, "success" | "warning"> = {
  Online: "success",
  Placeholder: "warning",
};

export default function AdminPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Administration</h1>
        <p className="mt-1 text-sm text-slate-500">
          Platform governance, system layer status, and configuration.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Governance gates */}
        <Card>
          <CardHeader>
            <CardTitle>V1 Governance Gates</CardTitle>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {governanceGates.map((gate) => (
              <div key={gate.id} className="flex items-start justify-between gap-4 px-6 py-4">
                <div>
                  <p className="font-mono text-xs font-bold text-slate-700">{gate.id}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{gate.desc}</p>
                </div>
                <Badge variant={gate.status === "Enforced" ? "info" : "warning"}>
                  {gate.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* System layers */}
        <Card>
          <CardHeader>
            <CardTitle>System Layers</CardTitle>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {systemLayers.map((mod) => (
              <div key={mod.layer} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-400">{mod.layer}</span>
                  <span className="text-sm text-slate-700">{mod.name}</span>
                </div>
                <Badge variant={layerStatusVariants[mod.status]}>{mod.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Nav cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          { href: "/admin/users", title: "User Management", desc: "Manage enterprise users and role assignments" },
          { href: "/admin/settings", title: "Platform Settings", desc: "View V1 configuration and governance rules" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div>
              <p className="font-semibold text-slate-900">{card.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{card.desc}</p>
            </div>
            <span className="text-slate-400">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
