'use client';

import { useEffect, useState } from 'react';

interface B2BSocialLinks {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  whatsapp: string;
}

interface B2BSettings {
  contact_email: string;
  contact_phone: string;
  address: string;
  business_hours_weekday: string;
  business_hours_saturday: string;
  announcement_bar: string;
  socials: B2BSocialLinks;
}

const EMPTY_SOCIALS: B2BSocialLinks = {
  facebook: '',
  instagram: '',
  linkedin: '',
  twitter: '',
  whatsapp: '',
};

const DEFAULT: B2BSettings = {
  contact_email: '',
  contact_phone: '',
  address: '',
  business_hours_weekday: '',
  business_hours_saturday: '',
  announcement_bar: '',
  socials: EMPTY_SOCIALS,
};

export default function B2BSettingsPage() {
  const [settings, setSettings] = useState<B2BSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        setErrorMessage('');
        const res = await fetch('/api/b2b/settings', { cache: 'no-store' });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to load settings');
        }
        const data = await res.json();
        setSettings({
          ...DEFAULT,
          ...data,
          socials: { ...EMPTY_SOCIALS, ...(data?.socials ?? {}) },
        });
      } catch {
        setErrorMessage('Unable to load B2B settings right now. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    }

    void loadSettings();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/b2b/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setStatus('error');
        setErrorMessage(typeof json?.error === 'string' && json.error.length > 0 ? json.error : 'Failed to save settings.');
        return;
      }

      setStatus('saved');
    } catch {
      setStatus('error');
      setErrorMessage('Failed to save settings. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  function field(label: string, key: keyof B2BSettings, type = 'text') {
    return (
      <div key={key}>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <input
          type={type}
          value={settings[key]}
          onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
          className="w-full h-10 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
    );
  }

  function socialField(label: string, key: keyof B2BSocialLinks, placeholder: string) {
    return (
      <div key={key}>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <input
          type="url"
          value={settings.socials[key]}
          placeholder={placeholder}
          onChange={(e) =>
            setSettings((prev) => ({
              ...prev,
              socials: {
                ...prev.socials,
                [key]: e.target.value,
              },
            }))
          }
          className="w-full h-10 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">B2B Site Settings</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">B2B Site Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage content used by the Prag B2B website contact and social sections</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-5 max-w-2xl">
        {field('Contact Email', 'contact_email', 'email')}
        {field('Contact Phone', 'contact_phone', 'tel')}
        {field('Address', 'address')}
        {field('Weekday Business Hours', 'business_hours_weekday')}
        {field('Saturday Business Hours', 'business_hours_saturday')}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Announcement Bar</label>
          <textarea
            value={settings.announcement_bar}
            onChange={(e) => setSettings((prev) => ({ ...prev, announcement_bar: e.target.value }))}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
        </div>

        <div className="pt-2 border-t border-gray-100 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Social Links</h2>
          {socialField('Facebook URL', 'facebook', 'https://facebook.com/your-page')}
          {socialField('Instagram URL', 'instagram', 'https://instagram.com/your-account')}
          {socialField('LinkedIn URL', 'linkedin', 'https://linkedin.com/company/your-company')}
          {socialField('X / Twitter URL', 'twitter', 'https://x.com/your-account')}
          {socialField('WhatsApp URL', 'whatsapp', 'https://wa.me/2348000000000')}
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-6 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {status === 'saved' && <p className="text-sm text-green-600 font-medium">Settings saved successfully.</p>}
          {status === 'error' && <p className="text-sm text-red-600 font-medium">{errorMessage || 'Something went wrong.'}</p>}
        </div>

        {!!errorMessage && status !== 'error' && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">{errorMessage}</p>
        )}
      </form>
    </div>
  );
}
