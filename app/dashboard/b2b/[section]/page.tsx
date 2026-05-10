export const dynamic = 'force-dynamic';

import type { ReactNode } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { readB2BAdminStore } from '@/lib/b2bAdminStore';
import B2BSettingsClient from '@/components/B2BSettingsClient';
import B2BAccessClient from '@/components/B2BAccessClient';
import B2BCaseStudiesClient from '@/components/B2BCaseStudiesClient';
import B2BSolutionsClient from '@/components/B2BSolutionsClient';

const SECTION_TITLES: Record<string, string> = {
  enquiries: 'Enquiries',
  distributors: 'Distributor Applications',
  installations: 'Installations',
  'case-studies': 'Case Studies',
  solutions: 'Solutions',
  pages: 'Pages',
  'site-settings': 'Site Settings',
  access: 'Backend Access',
  launch: 'Launch Control',
  scripts: 'Ecommerce Scripts',
  smtp: 'SMTP',
  forms: 'Forms Routing',
  audit: 'Audit Trail',
};

function SectionShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">B2B Admin</p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{title}</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-2xl">{description}</p>
      </div>
      {children}
    </div>
  );
}

export default async function B2BAdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { section } = await params;
  const store = await readB2BAdminStore();

  if (!(section in SECTION_TITLES)) {
    notFound();
  }

  if (section === 'site-settings') {
    return (
      <SectionShell
        title={SECTION_TITLES[section]}
        description="Manage the b2b contact details, header, footer, SMTP, forms and access rules in one place."
      >
        <B2BSettingsClient initialSettings={store.settings} />
      </SectionShell>
    );
  }

  if (section === 'access') {
    return (
      <SectionShell
        title={SECTION_TITLES[section]}
        description="Manage which WordPress users can enter B2B, and review the WordPress roles that can be granted access."
      >
        <B2BAccessClient />
      </SectionShell>
    );
  }

  if (section === 'launch') {
    return (
      <SectionShell title={SECTION_TITLES[section]} description="Temporary launch hold controls for the b2b experience.">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${store.settings.launch.enabled ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'}`}>
            {store.settings.launch.enabled ? 'Launch hold enabled' : 'Launch hold disabled'}
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{store.settings.launch.title}</h2>
          <p className="text-sm text-gray-600 max-w-2xl">{store.settings.launch.message}</p>
        </div>
      </SectionShell>
    );
  }

  if (section === 'scripts') {
    return (
      <SectionShell title={SECTION_TITLES[section]} description="Head, body and footer script slots for analytics and tracking snippets.">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {['head', 'body', 'footer'].map((slot) => (
            <div key={slot} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-900 capitalize mb-3">{slot}</h2>
              <pre className="whitespace-pre-wrap text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-4 min-h-48 overflow-auto">{store.settings.scripts[slot as keyof typeof store.settings.scripts] || 'No script configured.'}</pre>
            </div>
          ))}
        </div>
      </SectionShell>
    );
  }

  if (section === 'smtp') {
    return (
      <SectionShell title={SECTION_TITLES[section]} description="Shared SMTP settings that control b2b email delivery.">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Info label="Provider" value={store.settings.smtp.provider} />
          <Info label="Use WordPress mailer" value={store.settings.smtp.useWordPressMailer ? 'Yes' : 'No'} />
          <Info label="Host" value={store.settings.smtp.host} />
          <Info label="Port" value={String(store.settings.smtp.port)} />
          <Info label="Secure" value={store.settings.smtp.secure ? 'Yes' : 'No'} />
          <Info label="From email" value={store.settings.smtp.fromEmail || 'Not configured'} />
          <Info label="From name" value={store.settings.smtp.fromName} />
          <Info label="Username" value={store.settings.smtp.username || 'Not configured'} />
        </div>
      </SectionShell>
    );
  }

  if (section === 'forms') {
    return (
      <SectionShell title={SECTION_TITLES[section]} description="Routing rules for contact, distributor and installation forms.">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Form</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Recipients</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">From</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {store.settings.forms.map((rule) => (
                  <tr key={rule.formKey}>
                    <td className="px-6 py-4 font-medium text-gray-900">{rule.formName}</td>
                    <td className="px-6 py-4 text-gray-600">{rule.recipients.join(', ') || 'No recipients configured'}</td>
                    <td className="px-6 py-4 text-gray-600">{rule.fromEmail || 'Not configured'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (section === 'audit') {
    return (
      <SectionShell title={SECTION_TITLES[section]} description="B2B-only audit trail for settings, intake and publishing actions.">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                {store.audit.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">No audit entries yet.</td></tr>
                ) : store.audit.map((entry) => (
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
      </SectionShell>
    );
  }

  if (section === 'case-studies') {
    return (
      <SectionShell
        title={SECTION_TITLES[section]}
        description="Manage homepage and installations case studies, categories, metrics, and images from one backend module."
      >
        <B2BCaseStudiesClient initialCaseStudies={store.caseStudies} />
      </SectionShell>
    );
  }

  if (section === 'solutions') {
    return (
      <SectionShell
        title={SECTION_TITLES[section]}
        description="Manage residential, commercial, and industrial solution problems from one backend module with sorting controls."
      >
        <B2BSolutionsClient initialSolutions={store.solutions} />
      </SectionShell>
    );
  }

  const records = section === 'enquiries'
    ? store.enquiries
    : section === 'distributors'
      ? store.distributorApplications
      : store.installations;

  if (section === 'installations') {
    return (
      <SectionShell title={SECTION_TITLES[section]} description="Manage installation projects, statuses and internal notes.">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">No installations have been logged yet.</td></tr>
                ) : records.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 font-medium text-gray-900">{record.clientName}</td>
                    <td className="px-6 py-4 text-gray-600">{record.location}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{record.status}</td>
                    <td className="px-6 py-4 text-gray-600">{record.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title={SECTION_TITLES[section]} description={`Track and manage ${section === 'enquiries' ? 'contact enquiries' : 'distributor applications'} in the b2b workspace.`}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Message</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No records available yet.</td></tr>
              ) : records.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{record.name}</td>
                  <td className="px-6 py-4 text-gray-600">{record.email}</td>
                  <td className="px-6 py-4 text-gray-600">{record.company || '-'}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-md">{record.message}</td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{record.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-1 break-words">{value}</p>
    </div>
  );
}