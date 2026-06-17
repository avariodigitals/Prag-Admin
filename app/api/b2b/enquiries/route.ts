import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { buildWpAuthHeader, readB2BAdminStore, updateB2BAdminStore } from '@/lib/b2bAdminStore';

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://central.prag.global/wp-json';

type LocalEnquiry = {
  id: string;
  company?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  route?: string;
  message: string;
  status?: string;
  createdAt?: string;
};

function normalizeStoreStatus(status: string): 'new' | 'in-review' | 'resolved' {
  const value = String(status || '').trim().toLowerCase();
  if (value === 'resolved' || value === 'converted') return 'resolved';
  if (value === 'new') return 'new';
  return 'in-review';
}

function getLocalEnquiries(params: { page: number; search: string; status: string }) {
  return readB2BAdminStore().then((store) => {
    const all = (Array.isArray(store.enquiries) ? store.enquiries : []) as LocalEnquiry[];
    const needle = params.search.trim().toLowerCase();

    const filtered = all.filter((item) => {
      const byStatus = !params.status || (item.status ?? 'new') === params.status;
      if (!byStatus) return false;
      if (!needle) return true;
      return [item.company, item.name, item.email, item.message]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });

    const perPage = 20;
    const offset = (params.page - 1) * perPage;
    const paged = filtered.slice(offset, offset + perPage).map((item) => {
      const route = item.route ?? '/contact';
      const routeBasedType = route === '/free-power-assessment' ? 'Free Power Assessment' : 'General Enquiry';
      const isGenericSubject = !item.subject || item.subject === 'General Enquiry';
      return {
        id: item.id,
        company: item.company ?? '',
        name: item.name ?? '',
        email: item.email ?? '',
        phone: item.phone ?? '',
        type: isGenericSubject ? routeBasedType : item.subject,
        route,
        message: item.message ?? '',
        status: item.status ?? 'new',
        date: item.createdAt ?? new Date().toISOString(),
      };
    });

    return { data: paged, total: filtered.length };
  });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') ?? '1';
  const pageNum = Math.max(1, Number(page) || 1);
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';

  const qs = new URLSearchParams({ page, per_page: '20', ...(search && { search }), ...(status && { status }) });

  try {
    const res = await fetch(`${WP_API_URL}/prag-core/v1/b2b/enquiries?${qs}`, {
      headers: await buildWpAuthHeader(),
      cache: 'no-store',
    });
    if (!res.ok) {
      const local = await getLocalEnquiries({ page: pageNum, search, status });
      return NextResponse.json(local);
    }

    const data = await res.json();
    const total = Number(res.headers.get('X-WP-Total') ?? data.length ?? 0);
    if (Array.isArray(data) && data.length > 0) {
      const filtered = data.filter((item: Record<string, unknown>) => {
        const route = String(item.route || '');
        const subject = String(item.subject || item.type || '');
        return route !== '/technical-support' && !subject.toLowerCase().includes('technical support');
      });
      return NextResponse.json({ data: filtered, total: Math.max(0, total - (data.length - filtered.length)) });
    }

    const local = await getLocalEnquiries({ page: pageNum, search, status });
    return NextResponse.json(local);
  } catch {
    const local = await getLocalEnquiries({ page: pageNum, search, status });
    return NextResponse.json(local);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, status } = body as { id: string; status: string };
  const storeStatus = normalizeStoreStatus(status);

  // Always update local store first
  await updateB2BAdminStore((store) => ({
    ...store,
    enquiries: store.enquiries.map((item) =>
      item.id === id ? { ...item, status: storeStatus } : item
    ),
  }));

  // Try to sync to WordPress (best-effort, non-blocking)
  try {
    const res = await fetch(`${WP_API_URL}/prag-core/v1/b2b/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...await buildWpAuthHeader() },
      body: JSON.stringify(body),
    });
    return NextResponse.json({ ok: res.ok });
  } catch {
    return NextResponse.json({ ok: true }); // local store was updated
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await updateB2BAdminStore((store) => ({
    ...store,
    enquiries: store.enquiries.filter((item) => item.id !== id),
  }));

  try {
    await fetch(`${WP_API_URL}/prag-core/v1/b2b/enquiries/${id}`, {
      method: 'DELETE',
      headers: await buildWpAuthHeader(),
    });
  } catch { /* best-effort */ }

  return NextResponse.json({ ok: true });
}
