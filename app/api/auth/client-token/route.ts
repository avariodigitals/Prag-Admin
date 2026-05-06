import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ok = await isAdmin(session.token);
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json({ token: session.token });
}