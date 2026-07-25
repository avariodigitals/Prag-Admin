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
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
        currentStatus === 'publish'
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-green-50 text-green-700 hover:bg-green-100'
      }`}>
      {loading ? '...' : currentStatus === 'publish' ? 'Unpublish' : 'Publish'}
    </button>
  );
}
