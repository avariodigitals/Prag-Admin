'use client';

import { useState } from 'react';
import type { SiteSettings } from '@/lib/types';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';

const inputCls = 'w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all';

export default function SettingsForm({ initialSettings }: { initialSettings: SiteSettings | null }) {
  const [form, setForm] = useState<SiteSettings>(initialSettings ?? {
    hero_title: '', hero_subtitle: '', contact_phone: '', contact_email: '', announcement_bar: '',
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  function set(field: keyof SiteSettings) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? 'success' : 'error');
    setTimeout(() => setStatus('idle'), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm">
          <CheckCircle2 size={16} /> Settings saved successfully!
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
          <AlertCircle size={16} /> Failed to save. Check your connection.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Hero Title</label>
          <input value={form.hero_title} onChange={set('hero_title')} className={inputCls} placeholder="Main headline" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Hero Subtitle</label>
          <input value={form.hero_subtitle} onChange={set('hero_subtitle')} className={inputCls} placeholder="Subheadline" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Contact Phone</label>
          <input value={form.contact_phone} onChange={set('contact_phone')} className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Contact Email</label>
          <input type="email" value={form.contact_email} onChange={set('contact_email')} className={inputCls} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">Announcement Bar</label>
        <textarea value={form.announcement_bar} onChange={set('announcement_bar')} rows={3}
          className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
          placeholder="Text shown in the top announcement bar..." />
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={status === 'saving'}
          className="flex items-center gap-2 px-6 py-3 bg-sky-700 text-white rounded-xl text-sm font-semibold hover:bg-sky-800 transition-colors disabled:opacity-60">
          <Save size={16} />
          {status === 'saving' ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}
