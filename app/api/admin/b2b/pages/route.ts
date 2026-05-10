import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { appendB2BAuditLog, readB2BAdminStore, updateB2BAdminStore } from '@/lib/b2bAdminStore';

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

  const store = await updateB2BAdminStore((current) => ({
    ...current,
    pages,
  }));

  await appendB2BAuditLog({
    actor: session.user?.user_email ?? 'admin',
    action: 'update',
    target: 'b2b pages',
    details: `Saved ${pages.length} b2b pages`,
  });

  return NextResponse.json({ pages: store.pages });
}
