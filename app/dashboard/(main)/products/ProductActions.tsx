'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { revalidateProducts } from '@/lib/revalidateFrontend';

interface Props {
  id: number;
  field: 'featured' | 'status' | 'delete';
  value: boolean | string;
  label: string;
  toggleValue?: string;
  productName?: string;
}

export default function ProductActions({ id, field, value, label, toggleValue, productName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
    setLoading(false);
    setConfirming(false);
    if (!res.ok) return;
    await revalidateProducts();
    router.refresh();
  }

  if (field === 'delete') {
    if (confirming) {
      return (
        <span className="inline-flex items-center gap-1">
          <button onClick={handleDelete} disabled={loading}
            className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer">
            {loading ? '...' : 'Confirm'}
          </button>
          <button onClick={() => setConfirming(false)}
            className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors cursor-pointer">
            Cancel
          </button>
        </span>
      );
    }
    return (
      <button onClick={() => setConfirming(true)}
        title={`Delete ${productName ?? 'product'}`}
        className="p-1.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer">
        <Trash2 size={15} />
      </button>
    );
  }

  async function handleToggle() {
    setLoading(true);
    const currentFeatured =
      typeof value === 'boolean' ? value : String(value).toLowerCase() === 'true';
    const body = field === 'featured'
      ? { id, featured: !currentFeatured }
      : { id, status: toggleValue };

    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) return;
    await revalidateProducts();
    router.refresh();
  }

  if (field === 'featured') {
    return (
      <button onClick={handleToggle} disabled={loading}
        title={value ? 'Unfeature this product' : 'Mark this product as featured'}
        className={`w-10 h-6 rounded-full transition-colors relative ${value ? 'bg-sky-700' : 'bg-gray-300'} disabled:opacity-50 cursor-pointer`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-5' : 'left-1'}`} />
      </button>
    );
  }

  return (
    <button onClick={handleToggle} disabled={loading}
      title={value === 'publish' ? 'Unpublish this product (move to draft)' : 'Publish this product to the storefront'}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
        value === 'publish'
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-sky-700 text-white hover:bg-sky-800'
      }`}>
      {loading ? '...' : label}
    </button>
  );
}
