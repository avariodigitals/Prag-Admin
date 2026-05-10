export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { getB2BOverview, readB2BAdminStore } from '@/lib/b2bAdminStore';

const cards = [
  { key: 'enquiries', label: 'Enquiries', href: '/dashboard/b2b/enquiries' },
  { key: 'distributorApplications', label: 'Distributor Apps', href: '/dashboard/b2b/distributors' },
  { key: 'installations', label: 'Installations', href: '/dashboard/b2b/installations' },
  { key: 'caseStudies', label: 'Case Studies', href: '/dashboard/b2b/case-studies' },
  { key: 'solutions', label: 'Solutions', href: '/dashboard/b2b/solutions' },
  { key: 'pages', label: 'Pages', href: '/dashboard/b2b/pages' },
  { key: 'livePages', label: 'Published Pages', href: '/dashboard/b2b/pages' },
  { key: 'pendingResponses', label: 'New Enquiries', href: '/dashboard/b2b/enquiries' },
] as const;

export default async function B2BAdminOverviewPage() {
  const session = await getSession();
  const store = await readB2BAdminStore();
  const overview = getB2BOverview(store);

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">B2B Admin</p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 max-w-2xl">A dedicated admin workspace for b2b enquiries, distributor applications, installations, pages and site controls.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map((card) => (
          <Link key={card.key} href={card.href} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-sky-200 hover:shadow-md transition-all">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{overview[card.key].toLocaleString()}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Latest Audit</h2>
              <p className="text-sm text-gray-500">Recent admin actions logged in the b2b workspace.</p>
            </div>
            <Link href="/dashboard/b2b/audit" className="text-sm text-sky-700 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {store.audit.slice(0, 5).length === 0 ? (
              <p className="text-sm text-gray-400 py-10 text-center">No audit entries yet.</p>
            ) : store.audit.slice(0, 5).map((entry) => (
              <div key={entry.id} className="rounded-xl border border-gray-100 p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-gray-900">{entry.action}</p>
                  <span className="text-xs text-gray-500">{new Date(entry.at).toLocaleString('en-GB')}</span>
                </div>
                <p className="text-sm text-gray-500">{entry.target}</p>
                {entry.details && <p className="text-sm text-gray-600">{entry.details}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Session</h2>
            <p className="text-sm text-gray-500">Current signed-in admin context.</p>
          </div>
          <div className="rounded-xl border border-gray-100 p-4 space-y-2 text-sm text-gray-600">
            <p><span className="font-medium text-gray-900">Name:</span> {session?.user?.user_display_name ?? 'Admin'}</p>
            <p><span className="font-medium text-gray-900">Email:</span> {session?.user?.user_email ?? 'Unknown'}</p>
            <p><span className="font-medium text-gray-900">Store:</span> B2B</p>
          </div>
          <div className="rounded-xl bg-sky-50 border border-sky-100 p-4 text-sm text-sky-900">
            Keep this workspace scoped to b2b only. B2C dashboard pages remain on the existing admin flow.
          </div>
        </div>
      </div>
    </div>
  );
}