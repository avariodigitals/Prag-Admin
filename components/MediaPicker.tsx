'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Search, X, Loader2, Check } from 'lucide-react';

interface MediaItem {
  id: number;
  source_url: string;
  alt: string;
  title: string;
  thumbnail: string;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (items: MediaItem[]) => void;
  multiple?: boolean;
  excludeIds?: number[];
}

export default function MediaPicker({ open, onClose, onSelect, multiple = true, excludeIds = [] }: MediaPickerProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const loadMedia = useCallback(async (pageNum: number, searchTerm: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum), per_page: '40' });
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      const res = await fetch(`/api/media/list?${params}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setMedia(data.media ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setPage(1);
    setSearch('');
    setSelected(new Set());
    setSelectedItems([]);
    void loadMedia(1, '');
  }, [open, loadMedia]);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      void loadMedia(1, value);
    }, 400);
  }

  function toggleSelect(item: MediaItem) {
    if (multiple) {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(item.id)) next.delete(item.id);
        else next.add(item.id);
        return next;
      });
      setSelectedItems((prev) => {
        if (prev.some((p) => p.id === item.id)) return prev.filter((p) => p.id !== item.id);
        return [...prev, item];
      });
    } else {
      setSelected(new Set([item.id]));
      setSelectedItems([item]);
    }
  }

  function handleConfirm() {
    onSelect(selectedItems);
    setSelected(new Set());
    setSelectedItems([]);
    onClose();
  }

  if (!open) return null;

  const excludeSet = new Set(excludeIds);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Media Library</h2>
          <button type="button" onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search media library..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && media.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : media.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-20">No media items found.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {media
                .filter((item) => !excludeSet.has(item.id))
                .map((item) => {
                  const isSelected = selected.has(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleSelect(item)}
                      className={`relative rounded-xl overflow-hidden border-2 aspect-square bg-gray-50 transition-all ${
                        isSelected ? 'border-sky-600 ring-2 ring-sky-200' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={item.thumbnail}
                        alt={item.alt || item.title}
                        fill
                        className="object-cover"
                        sizes="120px"
                        unoptimized
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-sky-600/20 flex items-center justify-center">
                          <div className="w-7 h-7 bg-sky-600 rounded-full flex items-center justify-center">
                            <Check size={16} className="text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {page > 1 && (
              <button type="button" onClick={() => { const p = page - 1; setPage(p); void loadMedia(p, search); }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
                Previous
              </button>
            )}
            <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
            {page < totalPages && (
              <button type="button" onClick={() => { const p = page + 1; setPage(p); void loadMedia(p, search); }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
                Next
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (
              <span className="text-sm text-gray-500">{selected.size} selected</span>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className="px-4 py-2 bg-sky-700 text-white rounded-lg text-sm font-medium hover:bg-sky-800 disabled:opacity-50 transition-colors"
            >
              Add Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
