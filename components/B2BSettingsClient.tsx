'use client';

import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import type { B2BSettings } from '@/lib/b2bAdminStore';

const inputCls = 'w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';
const areaCls = 'w-full min-h-24 p-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';

type Section = 'site' | 'header' | 'footer' | 'scripts' | 'smtp' | 'forms' | 'access' | 'launch';

export default function B2BSettingsClient({ initialSettings }: { initialSettings: B2BSettings }) {
  const [activeTab, setActiveTab] = useState<Section>('site');
  const [settings, setSettings] = useState<B2BSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const tabs = useMemo(
    () => [
      { key: 'site' as const, label: 'Site' },
      { key: 'header' as const, label: 'Header' },
      { key: 'footer' as const, label: 'Footer' },
      { key: 'scripts' as const, label: 'Scripts' },
      { key: 'smtp' as const, label: 'SMTP' },
      { key: 'forms' as const, label: 'Forms' },
      { key: 'access' as const, label: 'Access' },
      { key: 'launch' as const, label: 'Launch' },
    ],
    [],
  );

  function save() {
    setSaving(true);
    setStatus('idle');
    fetch('/api/admin/b2b/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })).catch(() => ({ ok: res.ok, data: null })))
      .then(({ ok, data }) => {
        setSaving(false);
        setStatus(ok ? 'success' : 'error');
        if (ok && data?.settings) {
          setSettings(data.settings as B2BSettings);
        }
      })
      .catch(() => {
        setSaving(false);
        setStatus('error');
      });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-sky-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {activeTab === 'site' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Contact phone</span>
              <input className={inputCls} value={settings.contact.contactPhone} onChange={(event) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, contactPhone: event.target.value } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Contact email</span>
              <input className={inputCls} value={settings.contact.contactEmail} onChange={(event) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, contactEmail: event.target.value } }))} />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-gray-700">Address</span>
              <input className={inputCls} value={settings.contact.address} onChange={(event) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, address: event.target.value } }))} />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-gray-700">WhatsApp link</span>
              <input className={inputCls} value={settings.contact.whatsapp} onChange={(event) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, whatsapp: event.target.value } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Facebook</span>
              <input className={inputCls} value={settings.contact.socials.facebook} onChange={(event) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, socials: { ...prev.contact.socials, facebook: event.target.value } } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Instagram</span>
              <input className={inputCls} value={settings.contact.socials.instagram} onChange={(event) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, socials: { ...prev.contact.socials, instagram: event.target.value } } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">LinkedIn</span>
              <input className={inputCls} value={settings.contact.socials.linkedin} onChange={(event) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, socials: { ...prev.contact.socials, linkedin: event.target.value } } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Twitter</span>
              <input className={inputCls} value={settings.contact.socials.twitter} onChange={(event) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, socials: { ...prev.contact.socials, twitter: event.target.value } } }))} />
            </label>
          </div>
        )}

        {activeTab === 'header' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-gray-700">Brand label</span>
              <input className={inputCls} value={settings.header.brandLabel} onChange={(event) => setSettings((prev) => ({ ...prev, header: { ...prev.header, brandLabel: event.target.value } }))} />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-gray-700">Announcement</span>
              <input className={inputCls} value={settings.header.announcement} onChange={(event) => setSettings((prev) => ({ ...prev, header: { ...prev.header, announcement: event.target.value } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">CTA label</span>
              <input className={inputCls} value={settings.header.ctaLabel} onChange={(event) => setSettings((prev) => ({ ...prev, header: { ...prev.header, ctaLabel: event.target.value } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">CTA href</span>
              <input className={inputCls} value={settings.header.ctaHref} onChange={(event) => setSettings((prev) => ({ ...prev, header: { ...prev.header, ctaHref: event.target.value } }))} />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-gray-700">Menu items (JSON array)</span>
              <textarea
                className={areaCls}
                value={JSON.stringify(settings.header.menuItems, null, 2)}
                onChange={(event) => {
                  try {
                    const menuItems = JSON.parse(event.target.value) as B2BSettings['header']['menuItems'];
                    setSettings((prev) => ({ ...prev, header: { ...prev.header, menuItems } }));
                  } catch {
                    setSettings((prev) => prev);
                  }
                }}
              />
            </label>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="grid grid-cols-1 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Tagline</span>
              <input className={inputCls} value={settings.footer.tagline} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, tagline: event.target.value } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Copyright</span>
              <input className={inputCls} value={settings.footer.copyright} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, copyright: event.target.value } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Footer columns (JSON array)</span>
              <textarea
                className={areaCls}
                value={JSON.stringify(settings.footer.columns, null, 2)}
                onChange={(event) => {
                  try {
                    const columns = JSON.parse(event.target.value) as B2BSettings['footer']['columns'];
                    setSettings((prev) => ({ ...prev, footer: { ...prev.footer, columns } }));
                  } catch {
                    setSettings((prev) => prev);
                  }
                }}
              />
            </label>
          </div>
        )}

        {activeTab === 'scripts' && (
          <div className="grid grid-cols-1 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Head scripts</span>
              <textarea className={areaCls} value={settings.scripts.head} onChange={(event) => setSettings((prev) => ({ ...prev, scripts: { ...prev.scripts, head: event.target.value } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Body scripts</span>
              <textarea className={areaCls} value={settings.scripts.body} onChange={(event) => setSettings((prev) => ({ ...prev, scripts: { ...prev.scripts, body: event.target.value } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Footer scripts</span>
              <textarea className={areaCls} value={settings.scripts.footer} onChange={(event) => setSettings((prev) => ({ ...prev, scripts: { ...prev.scripts, footer: event.target.value } }))} />
            </label>
          </div>
        )}

        {activeTab === 'smtp' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-gray-700">Use WordPress mailer</span>
              <select className={inputCls} value={settings.smtp.useWordPressMailer ? 'yes' : 'no'} onChange={(event) => setSettings((prev) => ({ ...prev, smtp: { ...prev.smtp, useWordPressMailer: event.target.value === 'yes' } }))}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
            <label className="space-y-1"><span className="text-sm font-medium text-gray-700">Host</span><input className={inputCls} value={settings.smtp.host} onChange={(event) => setSettings((prev) => ({ ...prev, smtp: { ...prev.smtp, host: event.target.value } }))} /></label>
            <label className="space-y-1"><span className="text-sm font-medium text-gray-700">Port</span><input className={inputCls} value={settings.smtp.port} onChange={(event) => setSettings((prev) => ({ ...prev, smtp: { ...prev.smtp, port: Number(event.target.value) || 587 } }))} /></label>
            <label className="space-y-1"><span className="text-sm font-medium text-gray-700">Username</span><input className={inputCls} value={settings.smtp.username} onChange={(event) => setSettings((prev) => ({ ...prev, smtp: { ...prev.smtp, username: event.target.value } }))} /></label>
            <label className="space-y-1"><span className="text-sm font-medium text-gray-700">Password</span><input className={inputCls} type="password" value={settings.smtp.password} onChange={(event) => setSettings((prev) => ({ ...prev, smtp: { ...prev.smtp, password: event.target.value } }))} /></label>
            <label className="space-y-1"><span className="text-sm font-medium text-gray-700">From email</span><input className={inputCls} value={settings.smtp.fromEmail} onChange={(event) => setSettings((prev) => ({ ...prev, smtp: { ...prev.smtp, fromEmail: event.target.value } }))} /></label>
            <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium text-gray-700">From name</span><input className={inputCls} value={settings.smtp.fromName} onChange={(event) => setSettings((prev) => ({ ...prev, smtp: { ...prev.smtp, fromName: event.target.value } }))} /></label>
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="space-y-4">
            {settings.forms.map((rule, index) => (
              <div key={rule.formKey} className="rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-gray-900">{rule.formName}</h3>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">{rule.formKey}</span>
                </div>
                <label className="space-y-1"><span className="text-sm font-medium text-gray-700">Recipients</span><input className={inputCls} value={rule.recipients.join(', ')} onChange={(event) => setSettings((prev) => ({ ...prev, forms: prev.forms.map((item, itemIndex) => itemIndex === index ? { ...item, recipients: event.target.value.split(',').map((itemValue) => itemValue.trim()).filter(Boolean) } : item) }))} /></label>
                <label className="space-y-1"><span className="text-sm font-medium text-gray-700">From email</span><input className={inputCls} value={rule.fromEmail} onChange={(event) => setSettings((prev) => ({ ...prev, forms: prev.forms.map((item, itemIndex) => itemIndex === index ? { ...item, fromEmail: event.target.value } : item) }))} /></label>
                <label className="space-y-1"><span className="text-sm font-medium text-gray-700">Sender name</span><input className={inputCls} value={rule.senderName} onChange={(event) => setSettings((prev) => ({ ...prev, forms: prev.forms.map((item, itemIndex) => itemIndex === index ? { ...item, senderName: event.target.value } : item) }))} /></label>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'access' && (
          <div className="space-y-4">
            {Object.entries(settings.access).map(([role, visibility]) => (
              <div key={role} className="rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-gray-900 capitalize">{role}</h3>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Role access</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(visibility).map(([key, enabled]) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-gray-700 capitalize">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(event) => setSettings((prev) => ({
                          ...prev,
                          access: {
                            ...prev.access,
                            [role]: {
                              ...prev.access[role],
                              [key]: event.target.checked,
                            },
                          },
                        }))}
                      />
                      {key.replace(/-/g, ' ')}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'launch' && (
          <div className="grid grid-cols-1 gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={settings.launch.enabled} onChange={(event) => setSettings((prev) => ({ ...prev, launch: { ...prev.launch, enabled: event.target.checked } }))} />
              Enable launch hold
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Title</span>
              <input className={inputCls} value={settings.launch.title} onChange={(event) => setSettings((prev) => ({ ...prev, launch: { ...prev.launch, title: event.target.value } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Message</span>
              <textarea className={areaCls} value={settings.launch.message} onChange={(event) => setSettings((prev) => ({ ...prev, launch: { ...prev.launch, message: event.target.value } }))} />
            </label>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {status === 'success' && <span className="text-sm text-green-600">Changes saved successfully.</span>}
          {status === 'error' && <span className="text-sm text-red-600">Something went wrong while saving.</span>}
        </div>
      </div>
    </div>
  );
}
