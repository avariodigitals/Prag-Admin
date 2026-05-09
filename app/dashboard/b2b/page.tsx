export const dynamic = 'force-dynamic';

import { Users, MessageSquare, MapPin, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://central.prag.global/wp-json';

async function getB2BStats() {
  try {
    const [distRes, enqRes] = await Promise.all([
      fetch(`${WP_API_URL}/prag-core/v1/b2b/distributors?per_page=1`, { cache: 'no-store' }).catch(() => null),
      fetch(`${WP_API_URL}/prag-core/v1/b2b/enquiries?per_page=5`, { cache: 'no-store' }).catch(() => null),
    ]);

    const totalDistributors = distRes?.ok ? Number(distRes.headers.get('X-WP-Total') ?? 0) : 0;
    const totalEnquiries = enqRes?.ok ? Number(enqRes.headers.get('X-WP-Total') ?? 0) : 0;
    const recentEnquiries = enqRes?.ok ? await enqRes.json() : [];

    return { totalDistributors, totalEnquiries, recentEnquiries };
  } catch {
    return { totalDistributors: 0, totalEnquiries: 0, recentEnquiries: [] };
  }
}

export default async function B2BDashboardPage() {
  const stats = await getB2BStats();

  const cards = [
    { label: 'Total Distributors', value: stats.totalDistributors, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50', href: '/dashboard/b2b/distributors' },
    { label: 'Total Enquiries', value: stats.totalEnquiries, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', href: '/dashboard/b2b/enquiries' },
    { label: 'Installations', value: '—', icon: MapPin, color: 'text-green-600', bg: 'bg-green-50', href: '/dashboard/b2b/installations' },
    { label: 'Active Partners', value: '—', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', href: '/dashboard/b2b/distributors' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">B2B Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your B2B business portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</p>
              </div>
              <div className={`${c.bg} ${c.color} p-3 rounded-xl`}><c.icon size={20} /></div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Recent Enquiries</h2>
          <Link href="/dashboard/b2b/enquiries" className="text-sm text-amber-600 hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Company', 'Contact', 'Type', 'Date'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">No enquiries yet</td>
                </tr>
              ) : (
                (stats.recentEnquiries as { id: number; company?: string; name?: string; contact?: string; type?: string; date?: string }[]).map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{e.company ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{e.name ?? e.contact ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{e.type ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{e.date ? new Date(e.date).toLocaleDateString('en-GB') : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
