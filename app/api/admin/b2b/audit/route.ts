import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { appendB2BAuditLog, readB2BAdminStore, updateB2BAdminStore } from '@/lib/b2bAdminStore';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const store = await readB2BAdminStore();
  return NextResponse.json({ logs: store.audit });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const store = await updateB2BAdminStore((current) => ({
    ...current,
    audit: [],
  }));

  await appendB2BAuditLog({
    actor: session.user?.user_email ?? 'admin',
    action: 'clear',
    target: 'audit trail',
    details: 'Cleared b2b audit log',
  });

  return NextResponse.json({ logs: store.audit });
}
