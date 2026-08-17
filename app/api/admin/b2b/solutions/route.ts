import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { appendB2BAuditLog, normalizeSolutionsContent, normalizeSolutionBodies, readB2BAdminStore, updateB2BAdminStore } from '@/lib/b2bAdminStore';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const store = await readB2BAdminStore();
  return NextResponse.json({ solutions: store.solutions, solutionBodies: store.solutionBodies });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const nextSolutions = normalizeSolutionsContent(body?.solutions ?? body);
  const nextSolutionBodies = normalizeSolutionBodies(body?.solutionBodies);

  const store = await updateB2BAdminStore((current) => ({
    ...current,
    solutions: nextSolutions,
    solutionBodies: nextSolutionBodies,
  }));

  const totalProblems = store.solutions.categories.reduce((count, category) => count + category.problems.length, 0);
  await appendB2BAuditLog({
    actor: session.user?.user_email ?? 'admin',
    action: 'update',
    target: 'b2b solutions',
    details: `Saved ${totalProblems} solution problems, ${Object.keys(store.solutionBodies).length} solution body overrides`,
  });

  return NextResponse.json({ solutions: store.solutions, solutionBodies: store.solutionBodies });
}
