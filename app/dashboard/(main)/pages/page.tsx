import Link from 'next/link';
import { redirect } from 'next/navigation';
import { readB2CPages, type B2CPageRecord } from '@/lib/adminStore';
import { encodeB2BPageId } from '@/lib/b2bPageRoute';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function B2CPagesListPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  let pages: B2CPageRecord[] = [];
  try {
    pages = await readB2CPages();
  } catch {
    pages = [];
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">Brand Site</p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">Pages</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-2xl">
          Manage content pages for the Prag brand site. Edit hero sections, content blocks, CTAs, and more.
        </p>
      </div>

      {pages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-500">No pages found. Pages will appear here once they are seeded from the brand site.</p>
          <p className="text-sm text-gray-400 mt-2">Contact your developer to seed the initial page content.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Route</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Sections</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.route} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{page.route}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{page.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{page.sections?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${page.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {page.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/pages/${encodeB2BPageId(page.route)}`}
                      className="text-sm font-medium text-amber-700 hover:text-amber-800"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
