import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const settingsGroups = [
  {
    section: "Release Configuration",
    items: [
      { key: "platform_version", label: "Platform Version", value: "V1" },
      { key: "current_phase", label: "Current Phase", value: "Phase 1" },
      { key: "d5_status", label: "Domain 5 Status", value: "Phase 2 — Blocked" },
    ],
  },
  {
    section: "Assessment Defaults",
    items: [
      { key: "synthesis_weight_version", label: "Synthesis Weight Version", value: "1.0.0-provisional" },
      { key: "supported_job_levels", label: "Supported Job Levels", value: "Entry, Manager, Executive" },
      { key: "item_formats", label: "Item Formats", value: "Likert, Forced-Choice, SJT" },
    ],
  },
  {
    section: "Governance Rules",
    items: [
      { key: "d1_in_restriction", label: "D1-IN Restriction", value: "operational_allowed_with_restrictions" },
      { key: "d5_le_gate", label: "D5-LE Gate", value: "multi-method evidence required" },
      { key: "d5_jdq_gate", label: "D5-JDQ Gate", value: "domain-specific validation required" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Read-only V1 configuration governed by the platform specification.
        </p>
      </div>

      <div className="space-y-6">
        {settingsGroups.map((group) => (
          <Card key={group.section}>
            <CardHeader>
              <CardTitle>{group.section}</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100">
              {group.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</p>
                    <p className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">{item.key}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 dark:text-slate-300">{item.value}</span>
                    <Badge variant="default">Read-only</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
