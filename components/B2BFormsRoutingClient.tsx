'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import type { B2BFormRoutingRule } from '@/lib/b2bAdminStore';

const inputCls = 'w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';

export default function B2BFormsRoutingClient({ initialForms }: { initialForms: B2BFormRoutingRule[] }) {
  const [forms, setForms] = useState<B2BFormRoutingRule[]>(initialForms);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  async function save() {
    setSaving(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/admin/b2b/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forms }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus('error');
        setSaving(false);
        return;
      }
      setStatus('success');
      if (Array.isArray(data?.settings?.forms)) {
        setForms(data.settings.forms as B2BFormRoutingRule[]);
      }
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  function update(index: number, patch: Partial<B2BFormRoutingRule>) {
    setForms((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-4">
      {forms.map((rule, index) => (
        <div key={`${rule.formKey}-${index}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Form key</span>
            <input className={inputCls} value={rule.formKey} onChange={(event) => update(index, { formKey: event.target.value })} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Form name</span>
            <input className={inputCls} value={rule.formName} onChange={(event) => update(index, { formName: event.target.value })} />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Recipients (comma separated)</span>
            <input
              className={inputCls}
              value={rule.recipients.join(', ')}
              onChange={(event) => update(index, { recipients: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">From email</span>
            <input className={inputCls} value={rule.fromEmail} onChange={(event) => update(index, { fromEmail: event.target.value })} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Sender name</span>
            <input className={inputCls} value={rule.senderName} onChange={(event) => update(index, { senderName: event.target.value })} />
          </label>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold transition-colors disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Routing'}
        </button>
        {status === 'success' && <span className="text-sm text-green-600">Form routing saved.</span>}
        {status === 'error' && <span className="text-sm text-red-600">Could not save form routing.</span>}
      </div>
    </div>
  );
}
