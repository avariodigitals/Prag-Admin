'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCcw, Save } from 'lucide-react';
import B2BAccessClient from '@/components/B2BAccessClient';
import type { B2BAuditRecord, B2BHeaderMenuItem, B2BSettings, B2BSectionKey } from '@/lib/b2bAdminStore';

const inputCls = 'w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';
const areaCls = 'w-full min-h-24 p-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';

type FrontendPullReport = {
  syncedAt: string;
  pagesCreated: number;
  sectionsCreated: number;
  footerColumnsCreated: number;
  pagesCreatedRoutes: string[];
  sectionsCreatedByRoute: Array<{ route: string; sectionIds: string[] }>;
  footerColumnsCreatedTitles: string[];
};

type Section = 'site' | 'header' | 'footer' | 'integrations' | '404-logs' | 'scripts' | 'smtp' | 'forms' | 'access' | 'launch' | 'audit';

type HeaderMenuKey = 'solutionsMenuItems' | 'productsMenuItems' | 'companyMenuItems';

function normalizeHeaderMenuItems(items: B2BHeaderMenuItem[] | undefined): B2BHeaderMenuItem[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const label = String(item?.label ?? '').trim();
      const href = String(item?.href ?? '').trim();
      const children = normalizeHeaderMenuItems(item?.children);
      const normalized: B2BHeaderMenuItem = { label, href };
      if (children.length > 0) normalized.children = children;
      return normalized;
    })
    .filter((item) => item.label || item.href || (item.children?.length ?? 0) > 0);
}

function updateMenuItemAtPath(
  items: B2BHeaderMenuItem[],
  path: number[],
  updater: (item: B2BHeaderMenuItem) => B2BHeaderMenuItem,
): B2BHeaderMenuItem[] {
  if (path.length === 0) return items;
  const [index, ...rest] = path;

  return items.map((item, itemIndex) => {
    if (itemIndex !== index) return item;
    if (rest.length === 0) return updater(item);

    const children = updateMenuItemAtPath(item.children ?? [], rest, updater);
    return children.length > 0 ? { ...item, children } : { ...item, children: undefined };
  });
}

function removeMenuItemAtPath(items: B2BHeaderMenuItem[], path: number[]): B2BHeaderMenuItem[] {
  if (path.length === 0) return items;
  const [index, ...rest] = path;

  if (rest.length === 0) {
    return items.filter((_, itemIndex) => itemIndex !== index);
  }

  return items
    .map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const children = removeMenuItemAtPath(item.children ?? [], rest);
      return children.length > 0 ? { ...item, children } : { ...item, children: undefined };
    })
    .filter(Boolean);
}

function addMenuItemAtPath(items: B2BHeaderMenuItem[], parentPath: number[] | null): B2BHeaderMenuItem[] {
  const newItem: B2BHeaderMenuItem = { label: 'New Item', href: '/' };
  if (!parentPath || parentPath.length === 0) return [...items, newItem];

  return updateMenuItemAtPath(items, parentPath, (item) => ({
    ...item,
    children: [...(item.children ?? []), newItem],
  }));
}

function HeaderMenuEditor({
  title,
  items,
  onChange,
}: {
  title: string;
  items: B2BHeaderMenuItem[];
  onChange: (next: B2BHeaderMenuItem[]) => void;
}) {
  const normalized = normalizeHeaderMenuItems(items);

  function updateAtPath(path: number[], key: 'label' | 'href', value: string) {
    const next = updateMenuItemAtPath(normalized, path, (item) => ({ ...item, [key]: value }));
    onChange(normalizeHeaderMenuItems(next));
  }

  function removeAtPath(path: number[]) {
    const next = removeMenuItemAtPath(normalized, path);
    onChange(normalizeHeaderMenuItems(next));
  }

  function addChild(parentPath: number[] | null) {
    const next = addMenuItemAtPath(normalized, parentPath);
    onChange(normalizeHeaderMenuItems(next));
  }

  function renderItems(menuItems: B2BHeaderMenuItem[], basePath: number[] = [], level = 0) {
    return menuItems.map((item, index) => {
      const path = [...basePath, index];
      const key = path.join('-');
      const hasChildren = Array.isArray(item.children) && item.children.length > 0;

      return (
        <div key={key} className="rounded-lg border border-gray-200 p-3 space-y-2 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-2 items-end">
            <label className="space-y-1">
              <span className="text-xs text-gray-500">Label</span>
              <input
                className={inputCls}
                value={item.label}
                onChange={(event) => updateAtPath(path, 'label', event.target.value)}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-gray-500">Href</span>
              <input
                className={inputCls}
                value={item.href}
                onChange={(event) => updateAtPath(path, 'href', event.target.value)}
              />
            </label>
            {level < 2 ? (
              <button
                type="button"
                className="h-10 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => addChild(path)}
              >
                Add Child
              </button>
            ) : <span />}
            <button
              type="button"
              className="h-10 px-3 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
              onClick={() => removeAtPath(path)}
            >
              Remove
            </button>
          </div>

          {hasChildren ? (
            <div className="ml-2 border-l border-gray-200 pl-3 space-y-2">
              {renderItems(item.children ?? [], path, level + 1)}
            </div>
          ) : null}
        </div>
      );
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <button
          type="button"
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          onClick={() => addChild(null)}
        >
          Add Item
        </button>
      </div>

      <div className="space-y-2">
        {normalized.length > 0 ? renderItems(normalized) : (
          <p className="text-sm text-gray-500">No menu items yet.</p>
        )}
      </div>
    </div>
  );
}

const ALL_TABS: Array<{ key: Section; label: string }> = [
  { key: 'site', label: 'Site' },
  { key: 'header', label: 'Header' },
  { key: 'footer', label: 'Footer' },
  { key: 'integrations', label: 'Integrations' },
  { key: '404-logs', label: '404 Logs' },
  { key: 'scripts', label: 'Scripts' },
  { key: 'smtp', label: 'SMTP' },
  { key: 'forms', label: 'Forms' },
  { key: 'access', label: 'Access' },
  { key: 'launch', label: 'Launch' },
  { key: 'audit', label: 'Audit Trail' },
];

export default function B2BSettingsClient({
  initialSettings,
  allowedTabs,
  defaultTab,
  auditRecords,
  showAccessManager,
  enableFrontendPull,
}: {
  initialSettings: B2BSettings;
  allowedTabs?: Section[];
  defaultTab?: Section;
  auditRecords?: B2BAuditRecord[];
  showAccessManager?: boolean;
  enableFrontendPull?: boolean;
}) {
  function formatActorLabel(actor?: string): string {
    const value = String(actor ?? '').trim();
    if (!value) return 'system';
    const atIndex = value.indexOf('@');
    if (atIndex > 0) return value.slice(0, atIndex);
    return value;
  }

  const tabs = useMemo(
    () => {
      if (!Array.isArray(allowedTabs) || allowedTabs.length === 0) return ALL_TABS;
      const allowedSet = new Set(allowedTabs);
      return ALL_TABS.filter((tab) => allowedSet.has(tab.key));
    },
    [allowedTabs],
  );

  const resolvedDefault = useMemo<Section>(() => {
    const preferred = defaultTab && tabs.some((tab) => tab.key === defaultTab) ? defaultTab : undefined;
    return preferred ?? tabs[0]?.key ?? 'site';
  }, [defaultTab, tabs]);

  const [activeTab, setActiveTab] = useState<Section>(resolvedDefault);
  const [settings, setSettings] = useState<B2BSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testEmail, setTestEmail] = useState('');
  const [testState, setTestState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [wpRoles, setWpRoles] = useState<string[]>([]);
  const [pullingFrontend, setPullingFrontend] = useState(false);
  const [pullFrontendError, setPullFrontendError] = useState('');
  const [pullFrontendReport, setPullFrontendReport] = useState<FrontendPullReport | null>(null);

  const allAuditRecords = Array.isArray(auditRecords) ? auditRecords : [];
  const logs404 = allAuditRecords.filter((entry) => entry.action === '404.not-found');

  useEffect(() => {
    fetch('/api/admin/users', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.roles)) setWpRoles(data.roles as string[]);
      })
      .catch(() => {});
  }, []);

  const allSectionKeys: string[] = [
    'overview', 'enquiries', 'distributors', 'installations', 'case-studies',
    'solutions', 'pages', 'site-settings', 'access', 'launch', 'scripts', 'smtp', 'forms', 'audit',
  ];

  const defaultRoleVisibility = Object.fromEntries(
    allSectionKeys.map((key) => [key, false])
  ) as Record<B2BSectionKey, boolean>;

  const mergedRoles = useMemo(() => {
    const configured = Object.keys(settings.access);
    const fromWp = wpRoles.filter((role) => !configured.includes(role));
    return { configured, unconfigured: fromWp };
  }, [settings.access, wpRoles]);

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

  async function runSmtpTest() {
    setTestState('sending');
    setTestMessage('');
    try {
      const res = await fetch('/api/admin/b2b/smtp-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setTestState('error');
        setTestMessage(String(data?.error ?? 'SMTP test failed.'));
        return;
      }

      setTestState('sent');
      setTestMessage(String(data?.message ?? 'SMTP test email sent.'));
    } catch {
      setTestState('error');
      setTestMessage('SMTP test failed.');
    }
  }

  async function pullFrontendStructure() {
    setPullingFrontend(true);
    setPullFrontendError('');
    try {
      const res = await fetch('/api/admin/b2b/settings/pull-frontend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setPullFrontendError(String(data?.error ?? 'Failed to pull frontend structure.'));
        return;
      }

      if (data?.settings) {
        setSettings(data.settings as B2BSettings);
      }
      setPullFrontendReport((data?.report as FrontendPullReport | undefined) ?? null);
    } catch {
      setPullFrontendError('Failed to pull frontend structure.');
    } finally {
      setPullingFrontend(false);
    }
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
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Contact label</span>
              <input className={inputCls} value={settings.header.contactLabel} onChange={(event) => setSettings((prev) => ({ ...prev, header: { ...prev.header, contactLabel: event.target.value } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Contact href</span>
              <input className={inputCls} value={settings.header.contactHref} onChange={(event) => setSettings((prev) => ({ ...prev, header: { ...prev.header, contactHref: event.target.value } }))} />
            </label>
            <div className="md:col-span-2 grid grid-cols-1 gap-4">
              <HeaderMenuEditor
                title="Solutions Menu"
                items={settings.header.solutionsMenuItems}
                onChange={(menuItems) => setSettings((prev) => ({
                  ...prev,
                  header: {
                    ...prev.header,
                    solutionsMenuItems: menuItems,
                  },
                }))}
              />

              <HeaderMenuEditor
                title="Products Menu"
                items={settings.header.productsMenuItems}
                onChange={(menuItems) => setSettings((prev) => ({
                  ...prev,
                  header: {
                    ...prev.header,
                    productsMenuItems: menuItems,
                  },
                }))}
              />

              <HeaderMenuEditor
                title="Company Menu"
                items={settings.header.companyMenuItems}
                onChange={(menuItems) => setSettings((prev) => ({
                  ...prev,
                  header: {
                    ...prev.header,
                    companyMenuItems: menuItems,
                    menuItems,
                  },
                }))}
              />

              <details className="rounded-xl border border-gray-200 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700">Advanced JSON Editor</summary>
                <div className="mt-4 grid grid-cols-1 gap-4">
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700">Solutions menu items (JSON array)</span>
                    <textarea
                      className={areaCls}
                      value={JSON.stringify(settings.header.solutionsMenuItems, null, 2)}
                      onChange={(event) => {
                        try {
                          const menuItems = JSON.parse(event.target.value) as B2BSettings['header']['solutionsMenuItems'];
                          setSettings((prev) => ({ ...prev, header: { ...prev.header, solutionsMenuItems: menuItems } }));
                        } catch {
                          setSettings((prev) => prev);
                        }
                      }}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700">Products menu items (JSON array)</span>
                    <textarea
                      className={areaCls}
                      value={JSON.stringify(settings.header.productsMenuItems, null, 2)}
                      onChange={(event) => {
                        try {
                          const menuItems = JSON.parse(event.target.value) as B2BSettings['header']['productsMenuItems'];
                          setSettings((prev) => ({ ...prev, header: { ...prev.header, productsMenuItems: menuItems } }));
                        } catch {
                          setSettings((prev) => prev);
                        }
                      }}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-gray-700">Company menu items (JSON array)</span>
                    <textarea
                      className={areaCls}
                      value={JSON.stringify(settings.header.companyMenuItems, null, 2)}
                      onChange={(event) => {
                        try {
                          const menuItems = JSON.parse(event.target.value) as B2BSettings['header']['companyMenuItems'];
                          setSettings((prev) => ({ ...prev, header: { ...prev.header, companyMenuItems: menuItems, menuItems } }));
                        } catch {
                          setSettings((prev) => prev);
                        }
                      }}
                    />
                  </label>
                </div>
              </details>
            </div>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="grid grid-cols-1 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Top CTA title</span>
              <input className={inputCls} value={settings.footer.ctaTitle} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, ctaTitle: event.target.value } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Top CTA description</span>
              <textarea className={areaCls} value={settings.footer.ctaDescription} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, ctaDescription: event.target.value } }))} />
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Primary CTA label</span>
                <input className={inputCls} value={settings.footer.primaryCtaLabel} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, primaryCtaLabel: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Primary CTA href</span>
                <input className={inputCls} value={settings.footer.primaryCtaHref} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, primaryCtaHref: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Secondary CTA label</span>
                <input className={inputCls} value={settings.footer.secondaryCtaLabel} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, secondaryCtaLabel: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Secondary CTA href</span>
                <input className={inputCls} value={settings.footer.secondaryCtaHref} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, secondaryCtaHref: event.target.value } }))} />
              </label>
            </div>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Company name</span>
              <input className={inputCls} value={settings.footer.companyName} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, companyName: event.target.value } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Company registration text</span>
              <input className={inputCls} value={settings.footer.companyRegistration} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, companyRegistration: event.target.value } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Tagline</span>
              <input className={inputCls} value={settings.footer.tagline} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, tagline: event.target.value } }))} />
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Support card lead text</span>
                <input className={inputCls} value={settings.footer.supportCardLeadText} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, supportCardLeadText: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Support card CTA text</span>
                <input className={inputCls} value={settings.footer.supportCardCtaText} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, supportCardCtaText: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Trust card title</span>
                <input className={inputCls} value={settings.footer.trustCardTitle} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, trustCardTitle: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Trust card subtitle</span>
                <input className={inputCls} value={settings.footer.trustCardSubtitle} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, trustCardSubtitle: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">WhatsApp helper text</span>
                <input className={inputCls} value={settings.footer.whatsappHelperText} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, whatsappHelperText: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Partner title</span>
                <input className={inputCls} value={settings.footer.partnerTitle} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, partnerTitle: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Partner description</span>
                <input className={inputCls} value={settings.footer.partnerDescription} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, partnerDescription: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Partner CTA text</span>
                <input className={inputCls} value={settings.footer.partnerCtaText} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, partnerCtaText: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Partner href</span>
                <input className={inputCls} value={settings.footer.partnerHref} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, partnerHref: event.target.value } }))} />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Contact heading</span>
                <input className={inputCls} value={settings.footer.contactHeading} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, contactHeading: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Head office label</span>
                <input className={inputCls} value={settings.footer.headOfficeLabel} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, headOfficeLabel: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Sales hotline label</span>
                <input className={inputCls} value={settings.footer.salesHotlineLabel} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, salesHotlineLabel: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Customer support label</span>
                <input className={inputCls} value={settings.footer.customerSupportLabel} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, customerSupportLabel: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">WhatsApp label</span>
                <input className={inputCls} value={settings.footer.whatsappLabel} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, whatsappLabel: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Email label</span>
                <input className={inputCls} value={settings.footer.emailLabel} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, emailLabel: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Working hours label</span>
                <input className={inputCls} value={settings.footer.workingHoursLabel} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, workingHoursLabel: event.target.value } }))} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Working hours text</span>
                <input className={inputCls} value={settings.footer.workingHoursText} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, workingHoursText: event.target.value } }))} />
              </label>
            </div>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Copyright</span>
              <input className={inputCls} value={settings.footer.copyright} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, copyright: event.target.value } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Disclaimer text</span>
              <input className={inputCls} value={settings.footer.disclaimerText} onChange={(event) => setSettings((prev) => ({ ...prev, footer: { ...prev.footer, disclaimerText: event.target.value } }))} />
            </label>
            <div className="space-y-3 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-900">Footer Columns</p>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => setSettings((prev) => ({
                    ...prev,
                    footer: {
                      ...prev.footer,
                      columns: [...prev.footer.columns, { title: 'New Column', items: [{ label: 'New Link', href: '/' }] }],
                    },
                  }))}
                >
                  Add Column
                </button>
              </div>

              {settings.footer.columns.map((column, columnIndex) => (
                <div key={`${column.title}-${columnIndex}`} className="rounded-xl border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="space-y-1 flex-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Column Title</span>
                      <input
                        className={inputCls}
                        value={column.title}
                        onChange={(event) => setSettings((prev) => ({
                          ...prev,
                          footer: {
                            ...prev.footer,
                            columns: prev.footer.columns.map((entry, entryIndex) => entryIndex === columnIndex ? { ...entry, title: event.target.value } : entry),
                          },
                        }))}
                      />
                    </label>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                      onClick={() => setSettings((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          columns: prev.footer.columns.filter((_, entryIndex) => entryIndex !== columnIndex),
                        },
                      }))}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Column Links</p>
                    {column.items.map((item, itemIndex) => (
                      <div key={`${item.label}-${itemIndex}`} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-end">
                        <label className="space-y-1">
                          <span className="text-xs text-gray-500">Label</span>
                          <input
                            className={inputCls}
                            value={item.label}
                            onChange={(event) => setSettings((prev) => ({
                              ...prev,
                              footer: {
                                ...prev.footer,
                                columns: prev.footer.columns.map((entry, entryIndex) => entryIndex === columnIndex
                                  ? {
                                    ...entry,
                                    items: entry.items.map((link, linkIndex) => linkIndex === itemIndex ? { ...link, label: event.target.value } : link),
                                  }
                                  : entry),
                              },
                            }))}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-xs text-gray-500">Href</span>
                          <input
                            className={inputCls}
                            value={item.href}
                            onChange={(event) => setSettings((prev) => ({
                              ...prev,
                              footer: {
                                ...prev.footer,
                                columns: prev.footer.columns.map((entry, entryIndex) => entryIndex === columnIndex
                                  ? {
                                    ...entry,
                                    items: entry.items.map((link, linkIndex) => linkIndex === itemIndex ? { ...link, href: event.target.value } : link),
                                  }
                                  : entry),
                              },
                            }))}
                          />
                        </label>
                        <button
                          type="button"
                          className="h-10 px-3 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                          onClick={() => setSettings((prev) => ({
                            ...prev,
                            footer: {
                              ...prev.footer,
                              columns: prev.footer.columns.map((entry, entryIndex) => entryIndex === columnIndex
                                ? { ...entry, items: entry.items.filter((_, linkIndex) => linkIndex !== itemIndex) }
                                : entry),
                            },
                          }))}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      onClick={() => setSettings((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          columns: prev.footer.columns.map((entry, entryIndex) => entryIndex === columnIndex
                            ? { ...entry, items: [...entry.items, { label: 'New Link', href: '/' }] }
                            : entry),
                        },
                      }))}
                    >
                      Add Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-900">Bottom Links</p>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => setSettings((prev) => ({
                    ...prev,
                    footer: {
                      ...prev.footer,
                      legalLinks: [...(prev.footer.legalLinks ?? []), { label: 'New Link', href: '/' }],
                    },
                  }))}
                >
                  Add Link
                </button>
              </div>
              {(settings.footer.legalLinks ?? []).map((item, index) => (
                <div key={`legal-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-end">
                  <label className="space-y-1">
                    <span className="text-xs text-gray-500">Label</span>
                    <input
                      className={inputCls}
                      value={item.label}
                      onChange={(event) => setSettings((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          legalLinks: (prev.footer.legalLinks ?? []).map((link, linkIndex) => linkIndex === index ? { ...link, label: event.target.value } : link),
                        },
                      }))}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-gray-500">Href</span>
                    <input
                      className={inputCls}
                      value={item.href}
                      onChange={(event) => setSettings((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          legalLinks: (prev.footer.legalLinks ?? []).map((link, linkIndex) => linkIndex === index ? { ...link, href: event.target.value } : link),
                        },
                      }))}
                    />
                  </label>
                  <button
                    type="button"
                    className="h-10 px-3 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                    onClick={() => setSettings((prev) => ({
                      ...prev,
                      footer: {
                        ...prev.footer,
                        legalLinks: (prev.footer.legalLinks ?? []).filter((_, linkIndex) => linkIndex !== index),
                      },
                    }))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === '404-logs' && (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">When</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Target</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs404.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">No 404 logs yet.</td></tr>
                  ) : logs404.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 text-gray-500">{new Date(entry.at).toLocaleString('en-GB')}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{entry.action}</td>
                      <td className="px-6 py-4 text-gray-600">{entry.target}</td>
                      <td className="px-6 py-4 text-gray-600">{entry.details ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Google Analytics Measurement ID</span>
              <input className={inputCls} placeholder="G-XXXXXXXXXX" value={settings.integrations.googleAnalyticsId} onChange={(event) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, googleAnalyticsId: event.target.value } }))} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-gray-700">Google Tag Manager ID</span>
              <input className={inputCls} placeholder="GTM-XXXXXXX" value={settings.integrations.googleTagManagerId} onChange={(event) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, googleTagManagerId: event.target.value } }))} />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-gray-700">Search Console Verification Code</span>
              <input className={inputCls} placeholder="google-site-verification token" value={settings.integrations.searchConsoleVerification} onChange={(event) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, searchConsoleVerification: event.target.value } }))} />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-gray-700">Zoho One Script</span>
              <textarea className={areaCls} placeholder="Paste Zoho One embed script or snippet" value={settings.integrations.zohoOneScript} onChange={(event) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, zohoOneScript: event.target.value } }))} />
            </label>
            <div className="md:col-span-2 rounded-xl border border-gray-200 p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">WhatsApp Chat Widget</p>
                  <p className="text-xs text-gray-500">Floating B2B chat widget shown on the frontend left side.</p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(settings.integrations.whatsappChatEnabled)}
                  onChange={(event) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, whatsappChatEnabled: event.target.checked } }))}
                  className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
              </div>
              <label className="space-y-1 block">
                <span className="text-sm font-medium text-gray-700">WhatsApp Number</span>
                <input
                  className={inputCls}
                  placeholder="+2348032170129"
                  value={settings.integrations.whatsappChatNumber ?? ''}
                  onChange={(event) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, whatsappChatNumber: event.target.value } }))}
                />
              </label>
              <label className="space-y-1 block">
                <span className="text-sm font-medium text-gray-700">Widget Label</span>
                <input
                  className={inputCls}
                  placeholder="Chat with us on WhatsApp"
                  value={settings.integrations.whatsappChatText ?? ''}
                  onChange={(event) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, whatsappChatText: event.target.value } }))}
                />
              </label>
            </div>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-gray-700">Custom Domain Hook</span>
              <textarea className={areaCls} placeholder="Optional domain-aware script snippet for future prag-b2b domains" value={settings.integrations.customDomainHook} onChange={(event) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, customDomainHook: event.target.value } }))} />
            </label>
          </div>
        )}

        {activeTab === 'scripts' && (
          <div className="grid grid-cols-1 gap-4">
            {enableFrontendPull && (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-sky-900">Pull Frontend Structure</p>
                    <p className="text-xs text-sky-700">Creates missing page blocks and footer columns without changing existing content values.</p>
                  </div>
                  <button
                    type="button"
                    onClick={pullFrontendStructure}
                    disabled={pullingFrontend}
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-800 disabled:opacity-60"
                  >
                    <RefreshCcw size={14} className={pullingFrontend ? 'animate-spin' : ''} />
                    {pullingFrontend ? 'Pulling...' : 'Pull Frontend Structure'}
                  </button>
                </div>
                {pullFrontendError ? (
                  <p className="text-xs text-red-600">{pullFrontendError}</p>
                ) : null}
                {pullFrontendReport ? (
                  <div className="rounded-lg border border-sky-200 bg-white p-3 text-xs text-gray-700 space-y-2">
                    <p>
                      Created {pullFrontendReport.pagesCreated} page(s), {pullFrontendReport.sectionsCreated} section block(s), and {pullFrontendReport.footerColumnsCreated} footer column(s).
                    </p>
                    {pullFrontendReport.pagesCreatedRoutes.length > 0 ? (
                      <p>Pages added: {pullFrontendReport.pagesCreatedRoutes.join(', ')}</p>
                    ) : null}
                    {pullFrontendReport.footerColumnsCreatedTitles.length > 0 ? (
                      <p>Footer columns added: {pullFrontendReport.footerColumnsCreatedTitles.join(', ')}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
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
            <div className="md:col-span-2 rounded-xl border border-gray-200 p-4 space-y-3 bg-gray-50">
              <p className="text-sm font-medium text-gray-800">Send SMTP Test Email</p>
              <p className="text-xs text-gray-500">Use this to verify B2B SMTP delivery when WordPress mailer is disabled.</p>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  className={inputCls}
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(event) => setTestEmail(event.target.value)}
                />
                <button
                  type="button"
                  onClick={runSmtpTest}
                  disabled={!testEmail || testState === 'sending'}
                  className="h-10 px-4 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold disabled:opacity-60"
                >
                  {testState === 'sending' ? 'Sending...' : 'Send Test'}
                </button>
              </div>
              {testMessage && (
                <p className={`text-xs ${testState === 'sent' ? 'text-green-600' : 'text-red-600'}`}>{testMessage}</p>
              )}
            </div>
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
            {mergedRoles.configured.map((role) => {
              const visibility = settings.access[role];
              return (
                <div key={role} className="rounded-xl border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</h3>
                      <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">Configured</span>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-red-500 hover:underline"
                      onClick={() => setSettings((prev) => {
                        const next = { ...prev.access };
                        delete next[role];
                        return { ...prev, access: next };
                      })}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {allSectionKeys.map((key) => (
                      <label key={key} className="flex items-center gap-2 text-sm text-gray-700 capitalize">
                        <input
                          type="checkbox"
                          checked={visibility?.[key as keyof typeof visibility] ?? false}
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
              );
            })}

            {mergedRoles.unconfigured.length > 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">WordPress Roles — Not Yet Configured</p>
                  <p className="text-xs text-gray-500 mt-0.5">Click &quot;Add Role&quot; to configure B2B section access for these roles.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mergedRoles.unconfigured.map((role) => (
                    <button
                      key={role}
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-colors"
                      onClick={() => setSettings((prev) => ({
                        ...prev,
                        access: {
                          ...prev.access,
                          [role]: { ...defaultRoleVisibility },
                        },
                      }))}
                    >
                      + {role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showAccessManager && (
              <div className="pt-2 border-t border-gray-100">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-gray-900">User Access Manager</h3>
                  <p className="text-sm text-gray-500">Manage B2B-enabled users, portal flags, and user-level menu permissions.</p>
                </div>
                <B2BAccessClient />
              </div>
            )}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">When</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Target</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allAuditRecords.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No audit entries yet.</td></tr>
                  ) : allAuditRecords.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 text-gray-500">{new Date(entry.at).toLocaleString('en-GB')}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{formatActorLabel(entry.actor)}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{entry.action}</td>
                      <td className="px-6 py-4 text-gray-600">{entry.target}</td>
                      <td className="px-6 py-4 text-gray-600">{entry.details ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
