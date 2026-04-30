import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const WP = `${process.env.NEXT_PUBLIC_WP_API_URL ?? 'https://central.prag.global/wp-json'}/wp/v2`;

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });

  const res = await fetch(`${WP}/posts/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) return NextResponse.json({ error: 'WP update failed' }, { status: res.status });
  return NextResponse.json(await res.json());
}
