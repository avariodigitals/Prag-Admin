import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';
import { readB2BAdminStore } from '@/lib/b2bAdminStore';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const kind = searchParams.get('kind');
  const store = await readB2BAdminStore();

  if (kind === 'distributor') {
    return NextResponse.json({ records: store.distributorApplications });
  }

  if (kind === 'careers') {
    return NextResponse.json({ records: store.careerApplications });
  }

  if (kind === 'installations') {
    return NextResponse.json({ records: store.installations });
  }

  return NextResponse.json({ records: store.enquiries });
}
