import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { appendB2BAuditLog, readB2BAdminStore, updateB2BAdminStore } from '@/lib/b2bAdminStore';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const store = await readB2BAdminStore();
  return NextResponse.json({ settings: store.settings });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const settings = body?.settings ?? body;

  const store = await updateB2BAdminStore((current) => ({
    ...current,
    settings: {
      ...current.settings,
      ...settings,
    },
  }));

  await appendB2BAuditLog({
    actor: session.user?.user_email ?? 'admin',
    action: 'update',
    target: 'b2b settings',
    details: 'Updated b2b settings from admin workspace',
  });

  return NextResponse.json({ settings: store.settings });
}
