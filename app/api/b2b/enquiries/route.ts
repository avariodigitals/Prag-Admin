import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://central.prag.global/wp-json';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') ?? '1';
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';

  const qs = new URLSearchParams({ page, per_page: '20', ...(search && { search }), ...(status && { status }) });

  try {
    const res = await fetch(`${WP_API_URL}/prag-core/v1/b2b/enquiries?${qs}`, {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: 'no-store',
    });
    if (!res.ok) return NextResponse.json({ data: [], total: 0 });
    const data = await res.json();
    const total = Number(res.headers.get('X-WP-Total') ?? data.length ?? 0);
    return NextResponse.json({ data, total });
  } catch {
    return NextResponse.json({ data: [], total: 0 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  try {
    const res = await fetch(`${WP_API_URL}/prag-core/v1/b2b/enquiries/${body.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
      body: JSON.stringify(body),
    });
    return NextResponse.json({ ok: res.ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
