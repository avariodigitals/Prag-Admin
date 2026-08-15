import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const PRAG = process.env.NEXT_PUBLIC_WP_API_URL || 'https://central.prag.global/wp-json';

export async function GET() {
  try {
    const res = await fetch(`${PRAG}/prag-core/v1/shipping/cities`, { cache: 'no-store' });
    if (!res.ok) return NextResponse.json({ cities: [] }, { status: 200 });
    const cities = await res.json();
    return NextResponse.json({ cities });
  } catch {
    return NextResponse.json({ cities: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${PRAG}/prag-core/v1/shipping/cities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json({ error: err.message ?? 'Failed to add city' }, { status: res.status });
  }
  const created = await res.json();
  return NextResponse.json(created);
}
