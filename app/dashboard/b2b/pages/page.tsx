export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { discoverB2BPages, readB2BAdminStore } from '@/lib/b2bAdminStore';
import B2BPagesDirectoryClient from '@/components/B2BPagesDirectoryClient';

export default async function B2BPagesIndexPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const store = await readB2BAdminStore();
  const discoveredPages = await discoverB2BPages();
  const pages = store.pages.length > 0 ? store.pages : discoveredPages;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">B2B Admin</p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">Pages</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-2xl">Choose a page card to open a separate editing screen with no long-scroll editor below.</p>
      </div>
      <B2BPagesDirectoryClient initialPages={pages} />
    </div>
  );
}
