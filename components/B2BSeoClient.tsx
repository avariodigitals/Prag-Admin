'use client';

import { useState } from 'react';
import { Save, Trash2, Plus, X, Search } from 'lucide-react';
import type { B2BSeoOverride, B2BSeoOverrideMap } from '@/lib/b2bAdminStore';

interface Props {
  initialSeoOverrides: B2BSeoOverrideMap;
}

// Priority routes that appear as quick-select buttons
const PRIORITY_ROUTES = [
  '/',
  '/products',
  '/products/inverters',
  '/products/hybrid-inverters',
  '/products/heavy-duty-inverters',
  '/products/voltage-stabilizers',
  '/products/relay-voltage-stabilizers',
  '/products/servo-voltage-stabilizers',
  '/products/thyristor-stabilizers',
  '/products/advanced-stabilizers',
  '/products/batteries',
  '/products/lithium-batteries',
  '/products/solar',
  '/products/solar-panels',
  '/products/solar-charge-controllers',
  '/products/protective-device',
  '/solutions',
  '/solutions/residential',
  '/solutions/commercial',
  '/solutions/industrial',
  '/solutions/backup-power',
  '/solutions/solar-energy',
  '/solutions/voltage-stabilization-protection',
  '/about',
  '/installations',
  '/knowledge-center',
];

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent';
const areaCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

export default function B2BSeoClient({ initialSeoOverrides }: Props) {
  const [seoOverrides, setSeoOverrides] = useState<B2BSeoOverrideMap>(initialSeoOverrides);
  const [editingRoute, setEditingRoute] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<B2BSeoOverride>({});
  const [customRoute, setCustomRoute] = useState('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function startEditing(route: string) {
    const existing = seoOverrides[route] || {};
    setEditingRoute(route);
    setEditForm({
      seoTitle: existing.seoTitle || '',
      seoDescription: existing.seoDescription || '',
      primaryKeyword: existing.primaryKeyword || '',
      secondaryKeywords: existing.secondaryKeywords || [],
      ogTitle: existing.ogTitle || '',
      ogDescription: existing.ogDescription || '',
      ogImage: existing.ogImage || '',
      canonicalOverride: existing.canonicalOverride || '',
      robotsIndex: existing.robotsIndex ?? true,
      seoNotes: existing.seoNotes || '',
    });
    setSaveMsg(null);
  }

  function cancelEditing() {
    setEditingRoute(null);
    setEditForm({});
    setSaveMsg(null);
  }

  async function handleSave() {
    if (!editingRoute) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/admin/b2b/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: editingRoute, override: editForm }),
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      setSeoOverrides(data.seoOverrides || {});
      setSaveMsg({ type: 'success', text: 'SEO override saved successfully.' });
      setEditingRoute(null);
      setEditForm({});
    } catch {
      setSaveMsg({ type: 'error', text: 'Failed to save SEO override.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(route: string) {
    if (!confirm(`Delete SEO override for ${route}?`)) return;
    try {
      const res = await fetch(`/api/admin/b2b/seo?route=${encodeURIComponent(route)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      const data = await res.json();
      setSeoOverrides(data.seoOverrides || {});
      setSaveMsg({ type: 'success', text: 'SEO override deleted.' });
    } catch {
      setSaveMsg({ type: 'error', text: 'Failed to delete SEO override.' });
    }
  }

  function addCustomRoute() {
    const route = customRoute.trim().startsWith('/') ? customRoute.trim() : `/${customRoute.trim()}`;
    if (!route) return;
    startEditing(route);
    setCustomRoute('');
  }

  const overrideRoutes = Object.keys(seoOverrides).sort();
  const filteredOverrides = overrideRoutes.filter((r) => r.toLowerCase().includes(search.toLowerCase()));
  const priorityRoutesWithoutOverride = PRIORITY_ROUTES.filter((r) => !seoOverrides[r]);

  return (
    <div className="space-y-6">
      {saveMsg && (
        <div className={`rounded-lg p-3 text-sm ${saveMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {saveMsg.text}
        </div>
      )}

      {/* Editing modal */}
      {editingRoute && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 md:p-8 flex items-center justify-center">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-gray-200 shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">SEO Override</h2>
                <p className="text-sm text-gray-500 mt-1 font-mono">{editingRoute}</p>
              </div>
              <button onClick={cancelEditing} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>SEO Title</label>
                <input className={inputCls} placeholder="SEO title override" value={editForm.seoTitle || ''} onChange={(e) => setEditForm({ ...editForm, seoTitle: e.target.value })} />
                <p className="text-xs text-gray-400 mt-1">Leave blank to use the approved default.</p>
              </div>

              <div>
                <label className={labelCls}>Meta Description</label>
                <textarea className={areaCls} rows={3} placeholder="Meta description override" value={editForm.seoDescription || ''} onChange={(e) => setEditForm({ ...editForm, seoDescription: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Primary Keyword <span className="text-gray-400 font-normal">(editorial only)</span></label>
                  <input className={inputCls} placeholder="e.g. inverter Nigeria" value={editForm.primaryKeyword || ''} onChange={(e) => setEditForm({ ...editForm, primaryKeyword: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Secondary Keywords <span className="text-gray-400 font-normal">(editorial only)</span></label>
                  <input className={inputCls} placeholder="comma-separated" value={(editForm.secondaryKeywords || []).join(', ')} onChange={(e) => setEditForm({ ...editForm, secondaryKeywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>OG Title</label>
                  <input className={inputCls} placeholder="OG title (defaults to SEO title)" value={editForm.ogTitle || ''} onChange={(e) => setEditForm({ ...editForm, ogTitle: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>OG Description</label>
                  <input className={inputCls} placeholder="OG description (defaults to meta description)" value={editForm.ogDescription || ''} onChange={(e) => setEditForm({ ...editForm, ogDescription: e.target.value })} />
                </div>
              </div>

              <div>
                <label className={labelCls}>OG Image URL</label>
                <input className={inputCls} placeholder="https://..." value={editForm.ogImage || ''} onChange={(e) => setEditForm({ ...editForm, ogImage: e.target.value })} />
              </div>

              <div>
                <label className={labelCls}>Canonical Override</label>
                <input className={inputCls} placeholder="https://www.prag.global/..." value={editForm.canonicalOverride || ''} onChange={(e) => setEditForm({ ...editForm, canonicalOverride: e.target.value })} />
                <p className="text-xs text-gray-400 mt-1">Leave blank to use the standard canonical URL.</p>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="robotsIndex" checked={editForm.robotsIndex !== false} onChange={(e) => setEditForm({ ...editForm, robotsIndex: e.target.checked })} />
                <label htmlFor="robotsIndex" className="text-sm text-gray-700">Indexable (allow search engines to index this page)</label>
              </div>

              <div>
                <label className={labelCls}>SEO Notes</label>
                <textarea className={areaCls} rows={2} placeholder="Internal notes (not rendered on frontend)" value={editForm.seoNotes || ''} onChange={(e) => setEditForm({ ...editForm, seoNotes: e.target.value })} />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={cancelEditing} className="px-4 py-2 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 disabled:opacity-60 flex items-center gap-2">
                <Save size={14} />
                {saving ? 'Saving...' : 'Save Override'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick-select priority routes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Priority Pages</h3>
        <p className="text-sm text-gray-500 mb-4">Click a route to create or edit its SEO override. These are the 26 approved priority pages.</p>
        <div className="flex flex-wrap gap-2">
          {PRIORITY_ROUTES.map((route) => {
            const hasOverride = Boolean(seoOverrides[route]);
            return (
              <button
                key={route}
                onClick={() => startEditing(route)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${hasOverride ? 'bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-200' : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'}`}
              >
                {route} {hasOverride && '✓'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom route input */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Custom Route</h3>
        <p className="text-sm text-gray-500 mb-3">Add an SEO override for a product, KC article, or any other route (e.g. <code className="text-xs bg-gray-100 px-1 rounded">/products/inverters/my-product</code>).</p>
        <div className="flex gap-2">
          <input className={inputCls} placeholder="/products/inverters/my-product-slug" value={customRoute} onChange={(e) => setCustomRoute(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustomRoute()} />
          <button onClick={addCustomRoute} className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 flex items-center gap-2 shrink-0">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Existing overrides */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Existing Overrides ({overrideRoutes.length})</h3>
          {overrideRoutes.length > 0 && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          )}
        </div>

        {filteredOverrides.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No SEO overrides yet. Click a priority route above to get started.</p>
        ) : (
          <div className="space-y-2">
            {filteredOverrides.map((route) => {
              const o = seoOverrides[route];
              return (
                <div key={route} className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-gray-900 truncate">{route}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {o.seoTitle || <span className="italic">no title override</span>}
                      {o.primaryKeyword && ` · ${o.primaryKeyword}`}
                      {o.robotsIndex === false && ' · noindex'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEditing(route)} className="p-2 text-gray-400 hover:text-sky-600" title="Edit">
                      <Save size={14} />
                    </button>
                    <button onClick={() => handleDelete(route)} className="p-2 text-gray-400 hover:text-red-600" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold mb-1">How overrides work</p>
        <p>SEO overrides take priority over the approved route defaults and automatic fallbacks. The Next.js frontend resolves metadata in this order:</p>
        <ul className="mt-2 ml-4 list-disc space-y-0.5">
          <li>Static pages: admin override → approved default → safe fallback</li>
          <li>Product categories: admin override → approved category config → category fallback</li>
          <li>Products: admin override → automatic fallback ({'{Product Name} | PRAG'})</li>
          <li>Knowledge Center: admin override → Yoast meta → article title/excerpt</li>
        </ul>
        <p className="mt-2">Primary Keyword and Secondary Keywords are editorial fields only — they are never output as <code>&lt;meta name="keywords"&gt;</code>.</p>
      </div>
    </div>
  );
}
