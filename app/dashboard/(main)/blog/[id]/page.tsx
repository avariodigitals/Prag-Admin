export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import BlogEditor from '../BlogEditor';
import { getSession } from '@/lib/auth';

const WP = `${process.env.NEXT_PUBLIC_WP_API_URL ?? 'https://central.prag.global/wp-json'}/wp/v2`;

interface Props {
  params: Promise<{ id: string }>;
}

async function getPost(id: string, token: string) {
  try {
    const res = await fetch(`${WP}/posts/${id}?context=edit`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getMediaUrl(mediaId: number, token: string): Promise<string | null> {
  if (!mediaId) return null;
  try {
    const res = await fetch(`${WP}/media/${mediaId}`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.source_url ?? data?.media_details?.sizes?.full?.source_url ?? null;
  } catch {
    return null;
  }
}

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  const post = await getPost(id, session?.token ?? '');

  if (!post) notFound();

  const featuredImageUrl = post.featured_media
    ? await getMediaUrl(post.featured_media, session?.token ?? '')
    : null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/blog" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Blog Post</h1>
          <p className="text-xs text-gray-500 mt-0.5">Post #{post.id}</p>
        </div>
      </div>
      <BlogEditor mode="edit" initialPost={post} initialFeaturedImageUrl={featuredImageUrl} />
    </div>
  );
}
