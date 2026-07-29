'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import QuickEditModal from './QuickEditModal';

interface ProductImage {
  id: number;
  src: string;
  alt: string;
}

interface QuickEditProduct {
  id: number;
  name: string;
  stock_status: string;
  regular_price: string;
  sale_price: string;
  images?: ProductImage[];
}

interface Props {
  product: QuickEditProduct;
}

export default function QuickEditButton({ product }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Quick edit product name, price, stock and image"
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 text-white hover:bg-gray-900 transition-colors cursor-pointer"
      >
        <Pencil size={12} />
        Quick Edit
      </button>
      <QuickEditModal product={product} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
