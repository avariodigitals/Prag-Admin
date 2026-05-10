import { NextResponse } from 'next/server';
import { readB2BAdminStore } from '@/lib/b2bAdminStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const store = await readB2BAdminStore();
  return NextResponse.json(
    {
      settings: store.settings,
      caseStudies: store.caseStudies,
      solutions: store.solutions,
      pages: store.pages,
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