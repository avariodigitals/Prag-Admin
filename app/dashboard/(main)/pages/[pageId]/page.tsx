export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import B2CPagesClient from '@/components/B2CPagesClient';
import { readB2CPages } from '@/lib/adminStore';
import { getSession } from '@/lib/auth';
import { decodeB2BPageId } from '@/lib/b2bPageRoute';

export default async function B2CPageEditorPage({ params }: { params: Promise<{ pageId: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { pageId } = await params;
  const route = decodeB2BPageId(pageId);
  const pages = await readB2CPages();
  const page = pages.find((entry) => entry.route === route);

  if (!page) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">Brand Site</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{page.title}</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">Section-based editor for {page.route}.</p>
        </div>
        <Link href="/dashboard/pages" className="text-sm font-medium text-amber-700 hover:text-amber-800">
          Back to all pages
        </Link>
      </div>
      <B2CPagesClient initialPages={pages} selectedRoute={route} />
    </div>
  );
}
