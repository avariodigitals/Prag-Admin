'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, BarChart3, ToggleLeft, ToggleRight } from 'lucide-react';

interface RedirectRule {
  id: string;
  source: string;
  destination: string;
  permanent: boolean;
  active: boolean;
  createdAt: string;
  hits: number;
}

export default function B2BRedirectsClient() {
  const [redirects, setRedirects] = useState<RedirectRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ source: '', destination: '', permanent: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRedirects();
  }, []);

  async function fetchRedirects() {
    try {
      const res = await fetch('/api/admin/b2b/redirects');
      const data = await res.json();
      if (data.success) {
        setRedirects(data.redirects || []);
      }
    } catch (error) {
      console.error('Failed to fetch redirects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/b2b/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setFormData({ source: '', destination: '', permanent: true });
        setShowForm(false);
        fetchRedirects();
      }
    } catch (error) {
      console.error('Failed to create redirect:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this redirect?')) return;

    try {
      const res = await fetch(`/api/admin/b2b/redirects?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchRedirects();
      }
    } catch (error) {
      console.error('Failed to delete redirect:', error);
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    try {
      const res = await fetch('/api/admin/b2b/redirects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active }),
      });

      if (res.ok) {
        fetchRedirects();
      }
    } catch (error) {
      console.error('Failed to update redirect:', error);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">URL Redirects</h2>
          <p className="text-sm text-gray-500 mt-1">Manage custom URL redirects for your site</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Redirect
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="/old-url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination URL</label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="/new-url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="permanent"
                checked={formData.permanent}
                onChange={(e) => setFormData({ ...formData, permanent: e.target.checked })}
                className="w-4 h-4 text-sky-700 border-gray-300 rounded focus:ring-sky-500"
              />
              <label htmlFor="permanent" className="text-sm text-gray-700">Permanent redirect (301)</label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Add Redirect'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {redirects.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p>No redirects configured yet</p>
            <p className="text-sm mt-1">Click "Add Redirect" to create your first redirect</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Source</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Hits</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {redirects.map((redirect) => (
                <tr key={redirect.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">{redirect.source}</code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{redirect.destination}</code>
                      <a
                        href={redirect.destination}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {redirect.permanent ? '301' : '302'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(redirect.id, !redirect.active)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {redirect.active ? <ToggleRight size={20} className="text-green-600" /> : <ToggleLeft size={20} className="text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <BarChart3 size={14} />
                      <span className="text-sm">{redirect.hits}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(redirect.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}