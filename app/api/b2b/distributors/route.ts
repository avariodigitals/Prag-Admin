import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { readB2BAdminStore, updateB2BAdminStore } from '@/lib/b2bAdminStore';

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://central.prag.global/wp-json';

type LocalDistributor = {
  id: string;
  company?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  status?: string;
  createdAt?: string;
};

function getLocalDistributors(params: { page: number; search: string; status: string }) {
  return readB2BAdminStore().then((store) => {
    const all = (Array.isArray(store.distributorApplications) ? store.distributorApplications : []) as LocalDistributor[];
    const needle = params.search.trim().toLowerCase();
    const filtered = all.filter((item) => {
      const byStatus = !params.status || (item.status ?? 'pending') === params.status;
      if (!byStatus) return false;
      if (!needle) return true;
      return [item.company, item.name, item.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
    const perPage = 20;
    const offset = (params.page - 1) * perPage;
    const paged = filtered.slice(offset, offset + perPage).map((item) => ({
      id: item.id,
      company: item.company ?? '',
      name: item.name ?? '',
      email: item.email ?? '',
      phone: item.phone ?? '',
      city: '',
      state: '',
      message: item.message ?? '',
      status: item.status ?? 'pending',
      date: item.createdAt ?? new Date().toISOString(),
    }));
    return { data: paged, total: filtered.length };
  });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') ?? '1';
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const pageNum = Math.max(1, Number(page) || 1);

  const qs = new URLSearchParams({ page, per_page: '20', ...(search && { search }), ...(status && { status }) });

  try {
    const res = await fetch(`${WP_API_URL}/prag-core/v1/b2b/distributors?${qs}`, {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      const local = await getLocalDistributors({ page: pageNum, search, status });
      return NextResponse.json(local);
    }
    const data = await res.json();
    const total = Number(res.headers.get('X-WP-Total') ?? data.length ?? 0);
    if (Array.isArray(data) && data.length > 0) {
      return NextResponse.json({ data, total });
    }
    const local = await getLocalDistributors({ page: pageNum, search, status });
    return NextResponse.json(local);
  } catch {
    const local = await getLocalDistributors({ page: pageNum, search, status });
    return NextResponse.json(local);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const { id, status } = body as { id: string; status: string };

  await updateB2BAdminStore((store) => ({
    ...store,
    distributorApplications: store.distributorApplications.map((item) =>
      String(item.id) === String(id) ? { ...item, status } : item
    ),
  }));

  try {
    const res = await fetch(`${WP_API_URL}/prag-core/v1/b2b/distributors/${body.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
      body: JSON.stringify(body),
    });
    return NextResponse.json({ ok: res.ok });
  } catch {
    return NextResponse.json({ ok: true });
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
    distributorApplications: store.distributorApplications.filter((item) => String(item.id) !== id),
  }));

  try {
    await fetch(`${WP_API_URL}/prag-core/v1/b2b/distributors/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.token}` },
    });
  } catch { /* best-effort */ }

  return NextResponse.json({ ok: true });
}
