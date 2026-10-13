import { NextResponse } from 'next/server';
import { readB2BAdminStore } from '@/lib/b2bAdminStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const store = await readB2BAdminStore();
  // PUBLIC payload — whitelist only what the frontend sites consume.
  // Never expose settings.smtp (contains the SMTP/Brevo password), forms
  // routing, access-control map, redirects, or any submission records.
  const settings = store.settings;
  return NextResponse.json(
    {
      settings: settings
        ? {
            contact: settings.contact,
            header: settings.header,
            footer: settings.footer,
            integrations: settings.integrations,
            launch: settings.launch,
            scripts: settings.scripts,
          }
        : undefined,
      caseStudies: store.caseStudies,
      solutions: store.solutions,
      solutionBodies: store.solutionBodies,
      pages: store.pages,
      seoOverrides: store.seoOverrides,
      updatedAt: store.audit[0]?.at ?? new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    },
  );
}