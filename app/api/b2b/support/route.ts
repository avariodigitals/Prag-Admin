import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { readB2BAdminStore, updateB2BAdminStore } from '@/lib/b2bAdminStore';

type LocalSupportSubmission = {
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

function normalizeStoreStatus(status: string): string {
  const value = String(status || '').trim().toLowerCase();
  const allowed = ['new', 'read', 'replied', 'contacted', 'qualified', 'converted', 'resolved', 'escalated', 'archived', 'in-review'];
  if (allowed.includes(value)) return value;
  return 'in-review';
}

function getLocalSupportSubmissions(params: { page: number; search: string; status: string }) {
  return readB2BAdminStore().then((store) => {
    const all = (Array.isArray(store.supportSubmissions) ? store.supportSubmissions : []) as LocalSupportSubmission[];
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
      return {
        id: item.id,
        company: item.company ?? '',
        name: item.name ?? '',
        email: item.email ?? '',
        phone: item.phone ?? '',
        type: item.subject || 'Technical Support',
        route: item.route ?? '/technical-support',
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

  const local = await getLocalSupportSubmissions({ page: pageNum, search, status });
  return NextResponse.json(local);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, status } = body as { id: string; status: string };
  const storeStatus = normalizeStoreStatus(status);

  await updateB2BAdminStore((store) => ({
    ...store,
    supportSubmissions: (store.supportSubmissions ?? []).map((item) =>
      item.id === id ? { ...item, status: storeStatus } : item
    ),
  }));

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await updateB2BAdminStore((store) => ({
    ...store,
    supportSubmissions: (store.supportSubmissions ?? []).filter((item) => item.id !== id),
  }));

  return NextResponse.json({ ok: true });
}
