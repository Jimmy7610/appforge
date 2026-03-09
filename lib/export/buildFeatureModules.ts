import { DetectedFeatures } from "./detectFeatures";

interface BuildFeatureModulesInput {
    idea: string;
    detectedFeatures: DetectedFeatures;
}

export function buildFeatureModules({ idea, detectedFeatures }: BuildFeatureModulesInput): Record<string, string> {
    const files: Record<string, string> = {};

    if (detectedFeatures.hasProfile) {
        files["app/profile/page.tsx"] = `export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Profile</h1>
        <p className="text-sm text-gray-400 mb-8">
          Your account on ${idea || "the platform"}.
        </p>

        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold">
                U
              </div>
              <div>
                <h2 className="font-semibold">User Name</h2>
                <p className="text-sm text-gray-400">user@example.com</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-0.5">Role</p>
                <p className="text-gray-200">Admin</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-0.5">Member Since</p>
                <p className="text-gray-200">Today</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-semibold mb-4">Account Details</h2>
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-200">Display Name</p>
                  <p className="text-xs text-gray-500">How others see you</p>
                </div>
                <input type="text" defaultValue="User Name" className="w-48 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-white/20" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-200">Email</p>
                  <p className="text-xs text-gray-500">Your login email address</p>
                </div>
                <input type="email" defaultValue="user@example.com" className="w-48 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-white/20" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}`;
    }

    if (detectedFeatures.hasActivity) {
        files["app/activity/page.tsx"] = `const recentActivity = [
  { id: "1", action: "Project created", target: "${idea || "New Project"}", time: "Just now" },
  { id: "2", action: "Blueprint generated", target: "Version 1.0", time: "2 min ago" },
  { id: "3", action: "Settings updated", target: "Notifications", time: "1 hr ago" },
  { id: "4", action: "Bundle exported", target: "project-bundle.zip", time: "3 hrs ago" },
  { id: "5", action: "Member invited", target: "collaborator@email.com", time: "Yesterday" },
];

export default function ActivityPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Activity</h1>
        <p className="text-sm text-gray-400 mb-8">
          What\u2019s been happening in ${idea || "your workspace"}.
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <ul className="divide-y divide-white/5">
            {recentActivity.map((item) => (
              <li key={item.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors">
                <div>
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.target}</p>
                </div>
                <span className="text-xs text-gray-600 whitespace-nowrap">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}`;
    }

    if (detectedFeatures.hasTeam) {
        files["app/team/page.tsx"] = `const teamMembers = [
  { id: "1", name: "Project Owner", email: "owner@example.com", role: "Admin", initials: "PO" },
  { id: "2", name: "Developer", email: "dev@example.com", role: "Editor", initials: "DE" },
  { id: "3", name: "Designer", email: "design@example.com", role: "Viewer", initials: "DS" },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team</h1>
            <p className="mt-1 text-sm text-gray-400">
              People collaborating on ${idea || "this project"}.
            </p>
          </div>
          <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors">
            Invite
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <div key={member.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 text-sm font-bold text-blue-400">
                {member.initials}
              </div>
              <p className="text-sm font-semibold">{member.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{member.email}</p>
              <span className="mt-3 inline-block rounded-full bg-white/10 px-3 py-0.5 text-xs text-gray-300">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}`;
    }

    return files;
}
