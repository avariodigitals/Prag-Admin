import { NextRequest, NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://central.prag.global/wp-json';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  const media = new FormData();
  media.append('file', file, file.name);

  const res = await fetch(`${WP_API_URL}/wp/v2/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.token}` },
    body: media,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json({ error: data?.message ?? 'Upload failed' }, { status: res.status });
  }

  return NextResponse.json({
    id: data.id,
    url: data.source_url,
    alt: data.alt_text ?? file.name,
    title: data.title?.rendered ?? file.name,
  });
}