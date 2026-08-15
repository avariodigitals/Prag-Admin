'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, Save, Pencil, X, CheckCircle2, AlertCircle, Truck, Ban, Check } from 'lucide-react';

const inputCls = 'w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all';
const labelCls = 'text-sm font-semibold text-gray-700';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

interface ShippingCity {
  id: number;
  state: string;
  city: string;
  price: number;
  status: 'active' | 'suspended';
}

interface ShippingMethods {
  local_pickup: boolean;
  custom_delivery: boolean;
  city_based: boolean;
}

const METHOD_INFO: Array<{ key: keyof ShippingMethods; label: string; description: string }> = [
  { key: 'local_pickup', label: 'Local Pickup', description: 'Customer collects from a PRAG showroom.' },
  { key: 'custom_delivery', label: 'Custom Delivery', description: 'Chat with support to arrange delivery. No flat-rate price.' },
  { key: 'city_based', label: 'City-Based Delivery', description: 'Shows priced delivery options when the customer\u2019s city matches a row below.' },
];

export default function ShippingClient({ initialCities, initialMethods }: { initialCities: ShippingCity[]; initialMethods: ShippingMethods }) {
  const [cities, setCities] = useState<ShippingCity[]>(initialCities);
  const [methods, setMethods] = useState<ShippingMethods>(initialMethods);
  const [methodsSaving, setMethodsSaving] = useState(false);
  const [editing, setEditing] = useState<ShippingCity | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [filterState, setFilterState] = useState<string>('');

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Method toggles ──
  async function toggleMethod(key: keyof ShippingMethods) {
    const next = { ...methods, [key]: !methods[key] };
    setMethods(next);
    setMethodsSaving(true);
    try {
      const res = await fetch('/api/shipping/methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error();
      showToast('success', 'Shipping option updated.');
    } catch {
      setMethods(methods);
      showToast('error', 'Failed to update shipping option.');
    } finally {
      setMethodsSaving(false);
    }
  }

  // ── City CRUD ──
  function openNew() {
    setEditing({ id: 0, state: 'Lagos', city: '', price: 0, status: 'active' });
    setIsNew(true);
  }
  function openEdit(c: ShippingCity) { setEditing({ ...c }); setIsNew(false); }
  function closeEdit() { setEditing(null); setIsNew(false); }

  async function handleSave() {
    if (!editing) return;
    if (!editing.state || !editing.city.trim()) {
      showToast('error', 'State and city are required.');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch('/api/shipping/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        });
        if (!res.ok) throw new Error();
        const created = await res.json() as ShippingCity;
        setCities(p => [...p, created]);
        showToast('success', 'City added.');
      } else {
        const res = await fetch(`/api/shipping/cities/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        });
        if (!res.ok) throw new Error();
        const data = await res.json() as { cities: ShippingCity[] };
        setCities(data.cities);
        showToast('success', 'City updated.');
      }
      closeEdit();
    } catch {
      showToast('error', 'Failed to save city.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this city?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/shipping/cities/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setCities(p => p.filter(c => c.id !== id));
      showToast('success', 'City deleted.');
    } catch {
      showToast('error', 'Failed to delete city.');
    } finally {
      setDeleting(null);
    }
  }

  async function toggleSuspend(c: ShippingCity) {
    const newStatus = c.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/shipping/cities/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json() as { cities: ShippingCity[] };
      setCities(data.cities);
      showToast('success', newStatus === 'active' ? 'City activated.' : 'City suspended.');
    } catch {
      showToast('error', 'Failed to update city status.');
    }
  }

  const filteredCities = useMemo(() => {
    const sorted = [...cities].sort((a, b) => {
      if (a.state !== b.state) return a.state.localeCompare(b.state);
      return a.city.localeCompare(b.city);
    });
    if (!filterState) return sorted;
    return sorted.filter(c => c.state === filterState);
  }, [cities, filterState]);

  const stateCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of cities) {
      map.set(c.state, (map.get(c.state) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [cities]);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${toast.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── Shipping method toggles ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
        <div className="flex items-center gap-2 mb-1">
          <Truck size={18} className="text-sky-700" />
          <h2 className="text-base font-bold text-gray-900">Shipping Options</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">Toggle each shipping option on or off. When off, the option is hidden from customers at checkout — even if enabled in WooCommerce.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {METHOD_INFO.map((m) => (
            <label key={m.key} className={`flex flex-col gap-2 rounded-xl border p-4 cursor-pointer transition-colors ${methods[m.key] ? 'border-sky-200 bg-sky-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">{m.label}</span>
                <input
                  type="checkbox"
                  checked={methods[m.key]}
                  onChange={() => toggleMethod(m.key)}
                  disabled={methodsSaving}
                  className="w-5 h-5 accent-sky-700"
                />
              </div>
              <span className="text-xs text-gray-500">{m.description}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Cities table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">City-Based Delivery Zones</h2>
            <p className="text-xs text-gray-400">Only cities with a price &gt; 0 and &ldquo;active&rdquo; status show the city-based option at checkout. Suspend or set price to 0 to hide a city.</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-sky-700 text-white rounded-xl text-sm font-semibold hover:bg-sky-800 transition-colors">
            <Plus size={16} /> Add City
          </button>
        </div>

        {/* State filter */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterState('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${!filterState ? 'bg-sky-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All ({cities.length})
          </button>
          {stateCounts.map(([state, count]) => (
            <button
              key={state}
              onClick={() => setFilterState(state)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterState === state ? 'bg-sky-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {state} ({count})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">State</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCities.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-400">No cities found.</td></tr>
              ) : filteredCities.map((c) => (
                <tr key={c.id} className={c.status === 'suspended' ? 'opacity-50' : ''}>
                  <td className="px-3 py-2.5 text-gray-700">{c.state}</td>
                  <td className="px-3 py-2.5 text-gray-900 font-medium">{c.city}</td>
                  <td className="px-3 py-2.5 text-gray-700">
                    {c.price > 0 ? `\u20a6${c.price.toLocaleString('en-NG')}` : <span className="text-gray-400">&mdash;</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {c.status === 'active' ? <Check size={12} /> : <Ban size={12} />}
                      {c.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleSuspend(c)} title={c.status === 'active' ? 'Suspend' : 'Activate'} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                        <Ban size={15} />
                      </button>
                      <button onClick={() => openEdit(c)} title="Edit" className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id} title="Delete" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit / Add modal ── */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeEdit}>
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-gray-900">{isNew ? 'Add City' : 'Edit City'}</h4>
              <button onClick={closeEdit} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className={labelCls}>State</label>
                <select
                  value={editing.state}
                  onChange={e => setEditing({ ...editing, state: e.target.value })}
                  className={inputCls}
                >
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>City</label>
                <input
                  type="text"
                  value={editing.city}
                  onChange={e => setEditing({ ...editing, city: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Lekki"
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Delivery Price (&#8358;)</label>
                <input
                  type="number"
                  min={0}
                  value={editing.price}
                  onChange={e => setEditing({ ...editing, price: Number(e.target.value) })}
                  className={inputCls}
                  placeholder="0 = no city-based option shown"
                />
                <p className="text-xs text-gray-400">Set to 0 to hide the city-based option for this city.</p>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Status</label>
                <select
                  value={editing.status}
                  onChange={e => setEditing({ ...editing, status: e.target.value as 'active' | 'suspended' })}
                  className={inputCls}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button onClick={closeEdit} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-sky-700 text-white rounded-xl text-sm font-semibold hover:bg-sky-800 transition-colors disabled:opacity-60">
                <Save size={15} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
