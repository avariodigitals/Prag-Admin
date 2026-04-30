export const dynamic = 'force-dynamic';

import { getCustomers } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

interface Props { searchParams: Promise<{ page?: string; search?: string }> }

export default async function CustomersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const { data: customers, total } = await getCustomers(page, sp.search ?? '');
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">{total} registered customers</p>
      </div>

      <form className="flex flex-col md:flex-row gap-3">
        <input name="search" defaultValue={sp.search} placeholder="Search by name or email..."
          className="h-10 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 w-full md:w-72" />
        <button type="submit" className="h-10 px-5 bg-sky-700 text-white rounded-xl text-sm font-medium hover:bg-sky-800 transition-colors w-full md:w-auto">Search</button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Customer', 'Location', 'Orders', 'Total Spent', 'Joined'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.length === 0
                ? <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No customers found</td></tr>
                : customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden relative">
                          {c.avatar_url
                            ? <Image src={c.avatar_url} alt={c.first_name} fill className="object-cover" sizes="36px" />
                            : (c.first_name?.[0] ?? c.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{c.first_name} {c.last_name}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">{[c.billing?.city, c.billing?.state].filter(Boolean).join(', ') || '—'}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{c.orders_count}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">₦{Number(c.total_spent).toLocaleString('en-NG')}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(c.date_created).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={`?page=${page - 1}&search=${sp.search ?? ''}`} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">← Prev</Link>}
              {page < totalPages && <Link href={`?page=${page + 1}&search=${sp.search ?? ''}`} className="px-4 py-2 text-sm bg-sky-700 text-white rounded-xl hover:bg-sky-800">Next →</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
