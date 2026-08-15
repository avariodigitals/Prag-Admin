import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const PRAG = process.env.NEXT_PUBLIC_WP_API_URL || 'https://central.prag.global/wp-json';

export async function GET() {
  try {
    const res = await fetch(`${PRAG}/prag-core/v1/shipping/methods`, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ local_pickup: true, custom_delivery: true, city_based: true });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ local_pickup: true, custom_delivery: true, city_based: true });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${PRAG}/prag-core/v1/shipping/methods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to update shipping methods' }, { status: res.status });
  }
  const data = await res.json();
  return NextResponse.json(data);
}
