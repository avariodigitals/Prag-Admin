import { NextResponse } from 'next/server';
import { getSession, getCurrentWpUser, isSuperAdmin } from '@/lib/auth';
import { appendAuditLog, readAdminStore, updateAdminStore } from '@/lib/adminStore';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ok = await isSuperAdmin(session.token);
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const store = await readAdminStore();
  if (store.audit.length > 0) {
    return NextResponse.json({ logs: store.audit });
  }

  try {
    const actor = await getCurrentWpUser(session.token);
    await appendAuditLog({
      actorEmail: actor?.email ?? session.user?.user_email ?? 'unknown',
      action: 'audit.initialized',
      target: 'audit',
      details: 'Audit trail initialized.',
    });

    const refreshed = await readAdminStore();
    return NextResponse.json({ logs: refreshed.audit });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Could not persist audit logs.';
    return NextResponse.json({ error: detail, logs: [] }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ok = await isSuperAdmin(session.token);
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const previous = await readAdminStore();
  const removedCount = previous.audit.length;
  await updateAdminStore((current) => ({ ...current, audit: [] }));

  const actor = await getCurrentWpUser(session.token);
  await appendAuditLog({
    actorEmail: actor?.email ?? session.user?.user_email ?? 'unknown',
    action: 'audit.cleared',
    target: 'audit',
    details: `Cleared ${removedCount} audit records.`,
  });

  return NextResponse.json({ success: true, removed: removedCount });
}
