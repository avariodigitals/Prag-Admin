import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { buildWpAuthHeader, readB2BAdminStore, updateB2BAdminStore } from '@/lib/b2bAdminStore';

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://central.prag.global/wp-json';

type LocalCareerRecord = {
  id: string;
  kind: 'careers';
  status: 'new' | 'in-review' | 'resolved';
  name: string;
  email: string;
  phone?: string;
  location?: string;
  position?: string;
  experience?: string;
  education?: string;
  cvLink?: string;
  subject?: string;
  message: string;
  source: 'public-form' | 'admin';
  route: string;
  createdAt: string;
};

function normalizeStoreStatus(status: string): 'new' | 'in-review' | 'resolved' {
  const value = String(status || '').trim().toLowerCase();
  if (value === 'resolved' || value === 'rejected') return 'resolved';
  if (value === 'new') return 'new';
  return 'in-review';
}

function getLocalCareerApplications(params: { page: number; search: string; status: string }) {
  return readB2BAdminStore().then((store) => {
    const all = (Array.isArray(store.careerApplications) ? store.careerApplications : []) as LocalCareerRecord[];
    const needle = params.search.trim().toLowerCase();

    const filtered = all.filter((item) => {
      const byStatus = !params.status || (item.status ?? 'new') === params.status;
      if (!byStatus) return false;
      if (!needle) return true;
      return [item.name, item.email, item.phone, item.position, item.location, item.education]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });

    const perPage = 20;
    const offset = (params.page - 1) * perPage;
    const paged = filtered.slice(offset, offset + perPage).map((item) => ({
      id: item.id,
      name: item.name ?? '',
      email: item.email ?? '',
      phone: item.phone ?? '',
      location: item.location ?? '',
      position: item.position ?? '',
      experience: item.experience ?? '',
      education: item.education ?? '',
      cvLink: item.cvLink ?? '',
      subject: item.subject ?? 'Careers Application',
      message: item.message ?? '',
      status: item.status ?? 'new',
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
  const pageNum = Math.max(1, Number(page) || 1);
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';

  const qs = new URLSearchParams({ page, per_page: '20', ...(search && { search }), ...(status && { status }) });

  try {
    const res = await fetch(`${WP_API_URL}/prag-core/v1/b2b/careers?${qs}`, {
      headers: await buildWpAuthHeader(),
      cache: 'no-store',
    });
    if (!res.ok) {
      const local = await getLocalCareerApplications({ page: pageNum, search, status });
      return NextResponse.json(local);
    }

    const data = await res.json();
    const total = Number(res.headers.get('X-WP-Total') ?? data.length ?? 0);
    if (Array.isArray(data) && data.length > 0) {
      return NextResponse.json({ data, total });
    }

    const local = await getLocalCareerApplications({ page: pageNum, search, status });
    return NextResponse.json(local);
  } catch {
    const local = await getLocalCareerApplications({ page: pageNum, search, status });
    return NextResponse.json(local);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, status } = body as { id: string; status: string };
  const storeStatus = normalizeStoreStatus(status);

  await updateB2BAdminStore((store) => ({
    ...store,
    careerApplications: store.careerApplications.map((item) =>
      item.id === id ? { ...item, status: storeStatus } : item
    ),
  }));

  try {
    const res = await fetch(`${WP_API_URL}/prag-core/v1/b2b/careers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...await buildWpAuthHeader() },
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
    careerApplications: store.careerApplications.filter((item) => item.id !== id),
  }));

  try {
    await fetch(`${WP_API_URL}/prag-core/v1/b2b/careers/${id}`, {
      method: 'DELETE',
      headers: await buildWpAuthHeader(),
    });
  } catch { /* best-effort */ }

  return NextResponse.json({ ok: true });
}
