'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Save, CheckCircle2, AlertCircle, Loader2, Library } from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';
import { revalidateProducts } from '@/lib/revalidateFrontend';

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
  open: boolean;
  onClose: () => void;
}

const inputCls = 'w-full h-10 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all';
const labelCls = 'text-sm font-semibold text-gray-700';

export default function QuickEditModal({ product, open, onClose }: Props) {
  const router = useRouter();
  const [name, setName] = useState(product.name ?? '');
  const [stockStatus, setStockStatus] = useState(product.stock_status ?? 'instock');
  const [regularPrice, setRegularPrice] = useState(product.regular_price ?? '');
  const [salePrice, setSalePrice] = useState(product.sale_price ?? '');
  const [images, setImages] = useState<ProductImage[]>(product.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  if (!open) return null;

  async function handleSave() {
    setStatus('saving');
    const payload = {
      id: product.id,
      name,
      stock_status: stockStatus,
      regular_price: regularPrice,
      sale_price: salePrice,
      images: images.map((img) => ({ id: img.id, src: img.src, alt: img.alt })),
    };

    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setStatus('success');
      await revalidateProducts();
      setTimeout(() => {
        setStatus('idle');
        onClose();
        router.refresh();
      }, 1000);
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  async function uploadImage(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
    setUploading(false);

    if (!res.ok) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    const media = await res.json() as { id: number; source_url: string };
    const newImage: ProductImage = {
      id: media.id,
      src: media.source_url,
      alt: name || file.name.replace(/\.[^.]+$/, ''),
    };
    setImages((prev) => [newImage, ...prev]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Quick Edit</h2>
              <p className="text-xs text-gray-400 mt-0.5">#{product.id}</p>
            </div>
            <button type="button" onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5 space-y-5">
            {status === 'success' && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm">
                <CheckCircle2 size={16} /> Saved successfully!
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                <AlertCircle size={16} /> Failed to save. Please try again.
              </div>
            )}

            {/* Product Image */}
            <div className="space-y-2">
              <label className={labelCls}>Product Image</label>
              <div className="flex items-start gap-4">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                  {images[0] ? (
                    <Image src={images[0].src} alt={images[0].alt || 'Product'} fill className="object-contain p-2" sizes="96px" unoptimized />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-400">No image</div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="inline-flex items-center justify-center px-3 h-9 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                    {uploading ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files?.[0]) await uploadImage(e.target.files[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Library size={13} /> Library
                  </button>
                  {images[0] && (
                    <button
                      type="button"
                      onClick={() => removeImage(0)}
                      className="text-xs text-red-500 hover:text-red-600 text-left"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Product Name */}
            <div className="space-y-1.5">
              <label className={labelCls}>Product Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </div>

            {/* Price & Sale Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Regular Price (₦)</label>
                <input value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} className={inputCls} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Sale Price (₦)</label>
                <input value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className={inputCls} placeholder="0.00" />
              </div>
            </div>

            {/* Stock Status */}
            <div className="space-y-1.5">
              <label className={labelCls}>Stock Status</label>
              <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)} className={inputCls}>
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
                <option value="onbackorder">On Backorder</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={status === 'saving'}
              className="flex items-center gap-2 px-4 py-2 bg-sky-700 text-white rounded-lg text-sm font-medium hover:bg-sky-800 disabled:opacity-50 transition-colors"
            >
              {status === 'saving' ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {status === 'saving' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        multiple={false}
        excludeIds={images.map((img) => img.id)}
        onSelect={(items) => {
          if (items.length > 0) {
            const item = items[0];
            setImages((prev) => {
              const filtered = prev.filter((_, i) => i !== 0);
              return [{ id: item.id, src: item.source_url, alt: item.alt || item.title || name }, ...filtered];
            });
          }
        }}
      />
    </>
  );
}
