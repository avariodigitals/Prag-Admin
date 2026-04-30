import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { saveSiteSettings } from '@/lib/api';
import type { SiteSettings } from '@/lib/types';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const settings: SiteSettings = await req.json();
  const ok = await saveSiteSettings(settings, session.token);
  return NextResponse.json({ success: ok }, { status: ok ? 200 : 500 });
}
