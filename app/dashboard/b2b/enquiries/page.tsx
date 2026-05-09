'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';

interface Enquiry {
  id: number;
  company: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  message: string;
  status: string;
  date: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  read: 'bg-gray-100 text-gray-600',
  replied: 'bg-green-100 text-green-700',
  archived: 'bg-orange-100 text-orange-700',
};

const STATUSES = ['', 'new', 'read', 'replied', 'archived'];
const STATUS_LABELS: Record<string, string> = { '': 'All', new: 'New', read: 'Read', replied: 'Replied', archived: 'Archived' };

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const totalPages = Math.ceil(total / 20);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), ...(query && { search: query }), ...(status && { status }) });
    const res = await fetch(`/api/b2b/enquiries?${qs}`);
    const json = await res.json();
    setEnquiries(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, query, status]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enquiries</h1>
        <p className="text-gray-500 text-sm mt-1">{total} total B2B enquiries</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or name..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-10 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <button type="submit" className="h-10 px-5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors">
          Search
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Company', 'Contact', 'Type', 'Status', 'Date', ''].map((h, i) => (
                  <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : enquiries.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No enquiries found</td></tr>
              ) : (
                enquiries.flatMap((e) => [
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{e.company ?? '—'}</td>
                    <td className="px-5 py-4">
                      <p className="text-gray-900">{e.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{e.email ?? ''}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{e.type ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[e.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {e.status ?? 'new'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {e.date ? new Date(e.date).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                        className="text-xs text-amber-600 hover:underline"
                      >
                        {expanded === e.id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>,
                  expanded === e.id ? (
                    <tr key={`${e.id}-detail`} className="bg-amber-50/40">
                      <td colSpan={6} className="px-6 py-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Message</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{e.message ?? 'No message provided.'}</p>
                        {e.phone && <p className="text-xs text-gray-400 mt-2">Phone: {e.phone}</p>}
                      </td>
                    </tr>
                  ) : null,
                ])
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
