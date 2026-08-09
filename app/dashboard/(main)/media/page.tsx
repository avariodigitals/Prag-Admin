'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Search, Upload, Loader2, X, Copy, Check, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaItem {
  id: number;
  source_url: string;
  alt: string;
  title: string;
  thumbnail: string;
}

const PER_PAGE = 40;

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [copied, setCopied] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = useCallback(async (pageNum: number, searchTerm: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum), per_page: String(PER_PAGE) });
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      const res = await fetch(`/api/media/list?${params}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setMedia(data.media ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total ?? 0);
    } catch {
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMedia(1, '');
  }, [loadMedia]);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      void loadMedia(1, value);
    }, 400);
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);
    setUploadError('');
    try {
      for (const file of list) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const detail = await res.json().catch(() => ({}));
          throw new Error(detail.error || `Upload failed for ${file.name}`);
        }
      }
      // Refresh the current view so the new uploads appear
      await loadMedia(page, search);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) void uploadFiles(e.target.files);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Media</h1>
        <p className="text-gray-500 text-sm mt-1">{total} total items in the WordPress media library</p>
      </div>

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? 'border-sky-500 bg-sky-50' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-700">
            <Upload size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Drag &amp; drop images here to upload</p>
            <p className="text-xs text-gray-500 mt-0.5">or click the button below — uploads go straight to WordPress</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-sky-700 text-white rounded-xl text-sm font-medium hover:bg-sky-800 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {uploading ? 'Uploading...' : 'Select Files'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onFilePicked}
            className="hidden"
          />
          {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-80">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search media library..."
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {loading && media.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <ImageIcon size={28} />
            <p className="text-sm">No media items found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {media.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                className="relative rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50 hover:border-sky-400 hover:ring-2 hover:ring-sky-200 transition-all"
                title={item.title || item.alt || `#${item.id}`}
              >
                <Image
                  src={item.thumbnail}
                  alt={item.alt || item.title}
                  fill
                  className="object-cover"
                  sizes="160px"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => { const p = page - 1; setPage(p); void loadMedia(p, search); }}
              className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => { const p = page + 1; setPage(p); void loadMedia(p, search); }}
              className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 line-clamp-1">{selected.title || `Media #${selected.id}`}</h2>
              <button type="button" onClick={() => setSelected(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                <Image
                  src={selected.source_url}
                  alt={selected.alt || selected.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 640px"
                  unoptimized
                />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">File URL</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      readOnly
                      value={selected.source_url}
                      className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 bg-gray-50 font-mono"
                      onFocus={(e) => e.target.select()}
                    />
                    <button
                      type="button"
                      onClick={() => copyUrl(selected.source_url)}
                      className="h-10 px-3 bg-sky-700 text-white rounded-lg text-sm font-medium hover:bg-sky-800 transition-colors flex items-center gap-1.5"
                    >
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</label>
                    <p className="mt-1 text-gray-700">#{selected.id}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Alt text</label>
                    <p className="mt-1 text-gray-700">{selected.alt || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
