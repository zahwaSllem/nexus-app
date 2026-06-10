import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const users = [
  { id: "u001", name: "Admin User", email: "admin@nexus.io",    role: "Platform Admin",  status: "Active"   },
  { id: "u002", name: "HR Manager", email: "hr@nexus.io",      role: "Hiring Manager",  status: "Active"   },
  { id: "u003", name: "Reviewer",   email: "reviewer@nexus.io", role: "Report Reviewer", status: "Inactive" },
];

const roleClasses: Record<string, string> = {
  "Platform Admin": "bg-violet-50 text-violet-700 border border-violet-200",
  "Hiring Manager": "bg-blue-50 text-blue-700 border border-blue-200",
  "Report Reviewer": "bg-slate-100 text-slate-600",
};

export default function UsersPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Enterprise users and role assignments.</p>
        </div>
        <button
          disabled
          className="cursor-not-allowed rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white opacity-50"
        >
          + Invite User
        </button>
      </div>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {["User", "Email", "Role", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{u.name}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleClasses[u.role]}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={u.status === "Active" ? "success" : "default"}>{u.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
