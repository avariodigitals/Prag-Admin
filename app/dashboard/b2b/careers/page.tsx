'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2, X, Users, UserCheck, UserX, Clock } from 'lucide-react';

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  position: string;
  experience: string;
  education: string;
  cvLink: string;
  subject: string;
  message: string;
  status: string;
  date: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-sky-100 text-sky-700',
  'in-review': 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  shortlisted: 'bg-indigo-100 text-indigo-700',
  contacted: 'bg-violet-100 text-violet-700',
};

const STATUSES = ['', 'new', 'in-review', 'shortlisted', 'contacted', 'resolved', 'rejected'];

function labelize(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function ApplicantModal({
  applicant,
  onClose,
  onChangeAction,
  onSaveAction,
  saving,
}: {
  applicant: Applicant;
  onClose: () => void;
  onChangeAction: (value: string) => void;
  onSaveAction: () => void;
  saving: boolean;
}) {
  const actions = ['new', 'in-review', 'shortlisted', 'contacted', 'resolved', 'rejected'];
  const selected = applicant.status || 'new';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Applicant Details</p>
            <h2 className="text-lg font-bold text-gray-900 mt-1">{applicant.name || 'Unnamed applicant'}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center" aria-label="Close">
            <X size={18} className="text-gray-700" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <p><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{applicant.name || '—'}</span></p>
            <p><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900">{applicant.email || '—'}</span></p>
            <p><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-900">{applicant.phone || '—'}</span></p>
            <p><span className="text-gray-500">Location:</span> <span className="font-medium text-gray-900">{applicant.location || '—'}</span></p>
            <p><span className="text-gray-500">Position:</span> <span className="font-medium text-gray-900">{applicant.position || '—'}</span></p>
            <p><span className="text-gray-500">Experience:</span> <span className="font-medium text-gray-900">{applicant.experience || '—'}</span></p>
            <p><span className="text-gray-500">Education:</span> <span className="font-medium text-gray-900">{applicant.education || '—'}</span></p>
            <p><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-900">{formatDate(applicant.date)} {formatTime(applicant.date)}</span></p>
          </div>

          {applicant.cvLink && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">CV / Resume Link</p>
              <a href={applicant.cvLink} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-600 hover:underline break-all">
                {applicant.cvLink}
              </a>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Message / Cover Letter</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{applicant.message || 'No message provided.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Application Status</span>
              <select
                value={selected}
                onChange={(event) => onChangeAction(event.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {actions.map((option) => (
                  <option key={option} value={option}>{labelize(option)}</option>
                ))}
              </select>
            </label>
            <button
              onClick={onSaveAction}
              disabled={saving}
              className="h-11 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CareersAdminPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [savingAction, setSavingAction] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, new: 0, inReview: 0, shortlisted: 0, contacted: 0, resolved: 0, rejected: 0 });

  const totalPages = Math.ceil(total / 20);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      const qs = new URLSearchParams({ page: String(page), ...(query && { search: query }), ...(status && { status }) });
      const res = await fetch(`/api/b2b/careers?${qs}`);
      const json = await res.json();
      if (!cancelled) {
        setApplicants(json.data ?? []);
        setTotal(json.total ?? 0);
        setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [page, query, status]);

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      const statsRes = await fetch(`/api/b2b/careers?${new URLSearchParams({ per_page: '9999' })}`);
      const statsJson = await statsRes.json();
      const all = statsJson.data ?? [];
      if (!cancelled) {
        setStats({
          total: all.length,
          new: all.filter((a: Applicant) => (a.status || 'new') === 'new').length,
          inReview: all.filter((a: Applicant) => (a.status || '') === 'in-review').length,
          shortlisted: all.filter((a: Applicant) => (a.status || '') === 'shortlisted').length,
          contacted: all.filter((a: Applicant) => (a.status || '') === 'contacted').length,
          resolved: all.filter((a: Applicant) => (a.status || '') === 'resolved').length,
          rejected: all.filter((a: Applicant) => (a.status || '') === 'rejected').length,
        });
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setQuery(search);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this applicant? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/b2b/careers?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        setApplicants((current) => current.filter((item) => item.id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR — Career Applications</h1>
        <p className="text-gray-500 text-sm mt-1">{total} total applicants</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'text-gray-700', bg: 'bg-gray-50' },
          { label: 'New', value: stats.new, icon: Clock, color: 'text-sky-700', bg: 'bg-sky-50' },
          { label: 'In Review', value: stats.inReview, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Shortlisted', value: stats.shortlisted, icon: UserCheck, color: 'text-indigo-700', bg: 'bg-indigo-50' },
          { label: 'Contacted', value: stats.contacted, icon: UserCheck, color: 'text-violet-700', bg: 'bg-violet-50' },
          { label: 'Hired', value: stats.resolved, icon: UserCheck, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Rejected', value: stats.rejected, icon: UserX, color: 'text-rose-700', bg: 'bg-rose-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl border border-gray-100 p-4 flex flex-col gap-1`}>
            <div className="flex items-center gap-2">
              <Icon size={14} className={color} />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>
            </div>
            <span className="text-xl font-bold text-gray-900">{value}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, position, email..."
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
                {['Name', 'Position', 'Experience', 'Education', 'Location', 'Status', 'Date', ''].map((h) => (
                  <th key={h || 'actions'} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : applicants.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-400">No applicants found</td></tr>
              ) : (
                applicants.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{a.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{a.email ?? ''}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{a.position ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{a.experience ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{a.education ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{a.location ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {labelize(a.status || 'new')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                      <span className="block">{formatDate(a.date)}</span>
                      <span className="text-gray-400">{formatTime(a.date)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedApplicant(a)} className="text-xs text-amber-600 hover:underline">View</button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          disabled={deletingId === a.id}
                          className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                          aria-label="Delete applicant"
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

      {selectedApplicant && (
        <ApplicantModal
          applicant={selectedApplicant}
          saving={savingAction}
          onClose={() => setSelectedApplicant(null)}
          onChangeAction={(value) => setSelectedApplicant((current) => (current ? { ...current, status: value } : current))}
          onSaveAction={async () => {
            if (!selectedApplicant) return;
            setSavingAction(true);
            try {
              const res = await fetch('/api/b2b/careers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedApplicant.id, status: selectedApplicant.status }),
              });
              if (res.ok) {
                setApplicants((current) => current.map((item) => (item.id === selectedApplicant.id ? { ...item, status: selectedApplicant.status } : item)));
                setSelectedApplicant(null);
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
