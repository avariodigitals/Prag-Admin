'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { revalidateBlog } from '@/lib/revalidateFrontend';

export default function PostStatusToggle({ id, currentStatus }: { id: number; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const newStatus = currentStatus === 'publish' ? 'draft' : 'publish';
    await fetch('/api/posts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    setLoading(false);
    await revalidateBlog();
    router.refresh();
  }

  return (
    <button onClick={toggle} disabled={loading}
      title={currentStatus === 'publish' ? 'Unpublish this blog post (move to draft)' : 'Publish this blog post to the Knowledge Center'}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
        currentStatus === 'publish'
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-sky-700 text-white hover:bg-sky-800'
      }`}>
      {loading ? '...' : currentStatus === 'publish' ? 'Unpublish' : 'Publish'}
    </button>
  );
}
