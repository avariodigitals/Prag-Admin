import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { appendB2BAuditLog, normalizeCaseStudiesContent, readB2BAdminStore, updateB2BAdminStore } from '@/lib/b2bAdminStore';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const store = await readB2BAdminStore();
  return NextResponse.json({ caseStudies: store.caseStudies });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const nextCaseStudies = normalizeCaseStudiesContent(body?.caseStudies ?? body);

  const store = await updateB2BAdminStore((current) => ({
    ...current,
    caseStudies: nextCaseStudies,
  }));

  await appendB2BAuditLog({
    actor: session.user?.user_email ?? 'admin',
    action: 'update',
    target: 'b2b case studies',
    details: `Saved ${store.caseStudies.studies.length} case studies`,
  });

  return NextResponse.json({ caseStudies: store.caseStudies });
}
