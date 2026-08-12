import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { readB2CPages, writeB2CPages, appendAuditLog } from '@/lib/adminStore';

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

  await writeB2CPages(pages);

  await appendAuditLog({
    actorEmail: session.user?.user_email ?? 'admin',
    action: 'update',
    target: 'b2c pages',
    details: `Saved ${pages.length} b2c pages`,
  });

  return NextResponse.json({ pages });
}
