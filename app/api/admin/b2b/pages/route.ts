import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { readB2BAdminStore, updateB2BAdminStore } from '@/lib/b2bAdminStore';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const store = await readB2BAdminStore();
  return NextResponse.json({ pages: store.pages });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const pages = Array.isArray(body?.pages) ? body.pages : [];
  const actorEmail = session.user?.user_email ?? 'admin';

  // Single read-modify-write to avoid race condition between
  // updateB2BAdminStore and appendB2BAuditLog overwriting each other.
  const now = new Date().toISOString();
  const entryId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const store = await updateB2BAdminStore((current) => ({
    ...current,
    pages,
    audit: [
      { id: entryId, at: now, actor: actorEmail, action: 'update', target: 'b2b pages', details: `Saved ${pages.length} b2b pages` },
      ...current.audit,
    ].slice(0, 500),
  }));

  return NextResponse.json({ pages: store.pages });
}
