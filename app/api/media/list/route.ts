import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const WP = `${process.env.NEXT_PUBLIC_WP_API_URL ?? 'https://central.prag.global/wp-json'}/wp/v2`;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') ?? '1';
  const perPage = searchParams.get('per_page') ?? '40';
  const search = searchParams.get('search') ?? '';
  const mediaType = searchParams.get('media_type') ?? 'image';

  const params = new URLSearchParams({
    page,
    per_page: perPage,
    media_type: mediaType,
    _fields: 'id,source_url,alt_text,title,media_details',
  });

  if (search.trim()) {
    params.set('search', search.trim());
  }

  const res = await fetch(`${WP}/media?${params}`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: res.status });
  }

  const items = await res.json();
  const totalPages = res.headers.get('x-wp-totalpages') ?? '1';
  const total = res.headers.get('x-wp-total') ?? '0';

  const media = items.map((item: {
    id: number;
    source_url: string;
    alt_text: string;
    title?: { rendered?: string };
    media_details?: { sizes?: { thumbnail?: { source_url: string } } };
  }) => ({
    id: item.id,
    source_url: item.source_url,
    alt: item.alt_text ?? '',
    title: item.title?.rendered ?? '',
    thumbnail: item.media_details?.sizes?.thumbnail?.source_url ?? item.source_url,
  }));

  return NextResponse.json({
    media,
    totalPages: Number(totalPages),
    total: Number(total),
    page: Number(page),
  });
}
