'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Trash2, X } from 'lucide-react';

interface Enquiry {
  id: string;
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
  contacted: 'bg-indigo-100 text-indigo-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  converted: 'bg-purple-100 text-purple-700',
  escalated: 'bg-rose-100 text-rose-700',
  qualified: 'bg-cyan-100 text-cyan-700',
};

const STATUSES = ['', 'new', 'read', 'replied', 'contacted', 'qualified', 'converted', 'resolved', 'escalated', 'archived'];

function labelize(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getActionOptionsByEnquiryType(type: string) {
  const normalized = String(type || '').toLowerCase();
  if (normalized.includes('technical')) return ['contacted', 'escalated', 'resolved'];
  if (normalized.includes('partnership')) return ['contacted', 'qualified', 'converted', 'resolved'];
  if (normalized.includes('bulk')) return ['contacted', 'qualified', 'converted', 'resolved'];
  if (normalized.includes('product')) return ['contacted', 'converted', 'resolved'];
  return ['contacted', 'resolved', 'converted'];
}

function EnquiryModal({
  enquiry,
  onClose,
  onChangeAction,
  onSaveAction,
  saving,
}: {
  enquiry: Enquiry;
  onClose: () => void;
  onChangeAction: (value: string) => void;
  onSaveAction: () => void;
  saving: boolean;
}) {
  const options = getActionOptionsByEnquiryType(enquiry.type);
  const selected = enquiry.status || 'new';
  const allOptions = options.includes(selected) ? options : [selected, ...options];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Enquiry Details</p>
            <h2 className="text-lg font-bold text-gray-900 mt-1">{enquiry.name || 'Unnamed contact'}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center" aria-label="Close">
            <X size={18} className="text-gray-700" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <p><span className="text-gray-500">Company:</span> <span className="font-medium text-gray-900">{enquiry.company || '—'}</span></p>
            <p><span className="text-gray-500">Type:</span> <span className="font-medium text-gray-900">{enquiry.type || '—'}</span></p>
            <p><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900">{enquiry.email || '—'}</span></p>
            <p><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-900">{enquiry.phone || '—'}</span></p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Message</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{enquiry.message || 'No message provided.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Action taken</span>
              <select
                value={selected}
                onChange={(event) => onChangeAction(event.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {allOptions.map((option) => (
                  <option key={option} value={option}>{labelize(option)}</option>
                ))}
              </select>
            </label>
            <button
              onClick={onSaveAction}
              disabled={saving}
              className="h-11 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Action'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [savingAction, setSavingAction] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

    async function handleDelete(id: string) {
      if (!confirm('Delete this enquiry? This cannot be undone.')) return;
      setDeletingId(id);
      try {
        const res = await fetch(`/api/b2b/enquiries?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (res.ok) {
          setEnquiries((current) => current.filter((item) => item.id !== id));
          setTotal((prev) => Math.max(0, prev - 1));
        }
      } finally {
        setDeletingId(null);
      }
    }
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
          {STATUSES.map((s) => <option key={s} value={s}>{s ? labelize(s) : 'All'}</option>)}
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
                {['Company', 'Contact', 'Type', 'Action Taken', 'Date', ''].map((h) => (
                  <th key={h || 'actions'} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : enquiries.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No enquiries found</td></tr>
              ) : (
                enquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{e.company ?? '—'}</td>
                    <td className="px-5 py-4">
                      <p className="text-gray-900">{e.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{e.email ?? ''}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{e.type ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[e.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {labelize(e.status || 'new')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {e.date ? new Date(e.date).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedEnquiry(e)} className="text-xs text-amber-600 hover:underline">View</button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          disabled={deletingId === e.id}
                          className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                          aria-label="Delete enquiry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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

      {selectedEnquiry && (
        <EnquiryModal
          enquiry={selectedEnquiry}
          saving={savingAction}
          onClose={() => setSelectedEnquiry(null)}
          onChangeAction={(value) => setSelectedEnquiry((current) => (current ? { ...current, status: value } : current))}
          onSaveAction={async () => {
            if (!selectedEnquiry) return;
            setSavingAction(true);
            try {
              const res = await fetch('/api/b2b/enquiries', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedEnquiry.id, status: selectedEnquiry.status }),
              });
              if (res.ok) {
                setEnquiries((current) => current.map((item) => (item.id === selectedEnquiry.id ? { ...item, status: selectedEnquiry.status } : item)));
                setSelectedEnquiry(null);
              }
            } finally {
              setSavingAction(false);
            }
          }}
        />
      )}
    </div>
  );
}
