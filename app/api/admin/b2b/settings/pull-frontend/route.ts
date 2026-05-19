import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import {
  appendB2BAuditLog,
  pullFrontendStructureIntoAdmin,
} from '@/lib/b2bAdminStore';

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { store, report } = await pullFrontendStructureIntoAdmin();

  await appendB2BAuditLog({
    actor: session.user?.user_email ?? 'admin',
    action: 'sync',
    target: 'frontend structure',
    details: `Created ${report.pagesCreated} pages, ${report.sectionsCreated} sections, ${report.footerColumnsCreated} footer columns.`,
  });

  return NextResponse.json({
    ok: true,
    report,
    settings: store.settings,
    pages: store.pages,
  });
}
