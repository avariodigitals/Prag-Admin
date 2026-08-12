import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { readB2CPages, updateAdminStore } from '@/lib/adminStore';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const pages = await readB2CPages();
  return NextResponse.json({ pages });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const pages = Array.isArray(body?.pages) ? body.pages : [];
  const actorEmail = session.user?.user_email ?? 'admin';

  // Single read-modify-write to avoid race condition between
  // writeB2CPages and appendAuditLog overwriting each other.
  const now = new Date().toISOString();
  const entryId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  await updateAdminStore((current) => ({
    ...current,
    b2cPages: pages,
    audit: [
      { id: entryId, at: now, actorEmail, action: 'update', target: 'b2c pages', details: `Saved ${pages.length} b2c pages` },
      ...current.audit,
    ].slice(0, 500),
  }));

  return NextResponse.json({ pages });
}
