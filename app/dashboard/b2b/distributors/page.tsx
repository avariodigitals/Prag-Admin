'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';

interface Distributor {
  id: number;
  company: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  status: string;
  date: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  inactive: 'bg-gray-100 text-gray-600',
  rejected: 'bg-red-100 text-red-700',
};

export default function DistributorsPage() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(total / 20);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), ...(query && { search: query }) });
    const res = await fetch(`/api/b2b/distributors?${qs}`);
    const json = await res.json();
    setDistributors(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, query]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Distributors</h1>
        <p className="text-gray-500 text-sm mt-1">{total} total distributor applications</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or name..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <button type="submit" className="h-10 px-5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors">
          Search
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Company', 'Contact', 'Email', 'Phone', 'Location', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : distributors.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">No distributors found</td></tr>
              ) : (
                distributors.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{d.company ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-600">{d.name ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-500">{d.email ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-500">{d.phone ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-500">{[d.city, d.state].filter(Boolean).join(', ') || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[d.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {d.status ?? 'pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {d.date ? new Date(d.date).toLocaleDateString('en-GB') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <button onClick={() => setPage(page - 1)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">← Prev</button>
              )}
              {page < totalPages && (
                <button onClick={() => setPage(page + 1)} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-xl hover:bg-amber-700">Next →</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
