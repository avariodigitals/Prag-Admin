import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { runB2BAdminHealthCheck } from '@/lib/b2bAdminStore';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const health = await runB2BAdminHealthCheck();
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
