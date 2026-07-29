'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Save, AlertCircle, CheckCircle2, Library, Trash2 } from 'lucide-react';
import Image from 'next/image';
import MediaPicker from '@/components/MediaPicker';
import { revalidateBlog } from '@/lib/revalidateFrontend';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

interface BlogEditorProps {
  mode: 'create' | 'edit';
  initialPost?: {
    id: number;
    slug?: string;
    status?: string;
    featured_media?: number;
    title?: { rendered?: string };
    excerpt?: { rendered?: string };
    content?: { rendered?: string };
    meta?: {
      _yoast_wpseo_title?: string;
      _yoast_wpseo_metadesc?: string;
      _yoast_wpseo_focuskw?: string;
    };
  };
  initialFeaturedImageUrl?: string | null;
}

const inputCls = 'w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all';
const areaCls = 'w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-y';

export default function BlogEditor({ mode, initialPost, initialFeaturedImageUrl }: BlogEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title?.rendered ?? '');
  const [slug, setSlug] = useState(initialPost?.slug ?? '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialPost?.slug);
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt?.rendered?.replace(/<[^>]+>/g, '') ?? '');
  const [content, setContent] = useState(initialPost?.content?.rendered ?? '');
  const [status, setStatus] = useState(initialPost?.status ?? 'draft');
  const [featuredMedia, setFeaturedMedia] = useState<number>(initialPost?.featured_media ?? 0);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(initialFeaturedImageUrl ?? null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManuallyEdited) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .slice(0, 80)
      );
    }
  }

  const [seoTitle, setSeoTitle] = useState(initialPost?.meta?._yoast_wpseo_title ?? '');
  const [seoDescription, setSeoDescription] = useState(initialPost?.meta?._yoast_wpseo_metadesc ?? '');
  const [seoKeyphrase, setSeoKeyphrase] = useState(initialPost?.meta?._yoast_wpseo_focuskw ?? '');

  const [imageUploading, setImageUploading] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  async function uploadImage(file: File) {
    setImageUploading(true);
    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('/api/media/upload', {
      method: 'POST',
      body: fd,
    });

    setImageUploading(false);
    if (!res.ok) {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 2500);
      return;
    }

    const media = await res.json();
    setFeaturedMedia(media.id);
    setFeaturedImageUrl(media.source_url ?? null);
  }

  async function savePost() {
    if (!title.trim()) return;
    setSaveState('saving');
    const editId = initialPost?.id;

    const payload = {
      ...(mode === 'edit' && editId ? { id: editId } : {}),
      title,
      slug,
      excerpt,
      content,
      status,
      featured_media: featuredMedia,
      seo: {
        title: seoTitle,
        description: seoDescription,
        focusKeyphrase: seoKeyphrase,
      },
    };

    const res = await fetch('/api/posts', {
      method: mode === 'create' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 2500);
      return;
    }

    const saved = await res.json();
    setSaveState('success');

    await revalidateBlog();

    setTimeout(() => {
      setSaveState('idle');
      if (mode === 'create') {
        router.push(`/dashboard/blog/${saved.id}`);
        return;
      }
      router.refresh();
    }, 1000);
  }

  return (
    <>
    <div className="space-y-6">
      {saveState === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm"><CheckCircle2 size={16} /> Saved successfully.</div>
      )}
      {saveState === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm"><AlertCircle size={16} /> Save failed.</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Post Title</label>
            <input className={inputCls} value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Blog title" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Slug</label>
            <input
              className={inputCls}
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
              placeholder="post-slug"
            />
            <p className="text-xs text-gray-400">Auto-generated from title. Edit to override.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Status</label>
            <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">Draft</option>
              <option value="publish">Published</option>
              <option value="pending">Pending Review</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Excerpt</label>
            <textarea className={areaCls} rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <RichTextEditor
              label="Content"
              value={content}
              onChange={setContent}
              placeholder="Write your blog post content here..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Featured Image</h2>
        {featuredImageUrl ? (
          <div className="flex items-start gap-4">
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
              <Image src={featuredImageUrl} alt="Featured image" fill className="object-contain p-2" sizes="128px" unoptimized />
            </div>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center justify-center px-4 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                {imageUploading ? 'Uploading...' : 'Replace Image'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadImage(file);
                    e.target.value = '';
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => setMediaPickerOpen(true)}
                className="inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Library size={15} /> Library
              </button>
              <button
                type="button"
                onClick={() => { setFeaturedMedia(0); setFeaturedImageUrl(null); }}
                className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center justify-center px-4 h-11 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
              {imageUploading ? 'Uploading...' : 'Upload Image'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadImage(file);
                  e.target.value = '';
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => setMediaPickerOpen(true)}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Library size={15} /> Library
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">SEO</h2>
        <div className="grid grid-cols-1 gap-3">
          <input className={inputCls} placeholder="SEO Title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
          <textarea className={areaCls} rows={3} placeholder="SEO Description" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
          <input className={inputCls} placeholder="Focus Keyphrase" value={seoKeyphrase} onChange={(e) => setSeoKeyphrase(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={savePost} disabled={saveState === 'saving'} className="inline-flex items-center gap-2 px-6 py-3 bg-sky-700 text-white rounded-xl text-sm font-semibold hover:bg-sky-800 disabled:opacity-60">
          <Save size={16} /> {saveState === 'saving' ? 'Saving...' : mode === 'create' ? 'Create Post' : 'Save Post'}
        </button>
      </div>
    </div>

      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        multiple={false}
        onSelect={(items) => {
          if (items[0]) {
            setFeaturedMedia(items[0].id);
            setFeaturedImageUrl(items[0].source_url);
          }
        }}
      />
    </>
  );
}
