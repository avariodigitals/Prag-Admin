'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ImagePlus, Save } from 'lucide-react';
import type { B2BPageRecord } from '@/lib/b2bAdminStore';

const inputCls = 'w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';
const areaCls = 'w-full min-h-20 p-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';
const emptyImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="%23eef2f7"/><text x="320" y="200" text-anchor="middle" fill="%23808a9a" font-size="24" font-family="Arial, sans-serif">No image selected</text></svg>';

export default function B2BPagesClient({ initialPages, selectedRoute }: { initialPages: B2BPageRecord[]; selectedRoute: string }) {
  const [pages, setPages] = useState(initialPages);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadingKey, setUploadingKey] = useState('');
  const selectedPage = pages.find((page) => page.route === selectedRoute) ?? null;

  if (!selectedPage) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">Page not found</h2>
        <p className="text-sm text-gray-500 mt-2">The selected B2B page could not be loaded.</p>
        <Link href="/dashboard/b2b/pages" className="inline-flex mt-4 text-sm font-medium text-sky-700 hover:text-sky-800">
          Back to all pages
        </Link>
      </div>
    );
  }

  function updatePage(route: string, updater: (page: B2BPageRecord) => B2BPageRecord) {
    setPages((current) => current.map((page) => (page.route === route ? updater(page) : page)));
  }

  async function persistPages(nextPages: B2BPageRecord[]) {
    setSaving(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/admin/b2b/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: nextPages }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus('error');
        return;
      }

      setStatus('success');
      if (Array.isArray(data?.pages)) {
        setPages(data.pages as B2BPageRecord[]);
      }
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(route: string, sectionIndex: number, file: File) {
    const uploadKey = `${route}-${sectionIndex}`;
    setUploadingKey(uploadKey);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/b2b/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(String(data?.error ?? 'Upload failed'));
      }

      let nextPagesSnapshot: B2BPageRecord[] | null = null;
      setPages((currentPages) => {
        const nextPages = currentPages.map((page) => {
          if (page.route !== route) return page;
          return {
            ...page,
            sections: page.sections.map((section, currentIndex) => (
              currentIndex === sectionIndex
                ? { ...section, imageUrl: data.url, imageAlt: data.alt ?? section.title }
                : section
            )),
          };
        });
        nextPagesSnapshot = nextPages;
        return nextPages;
      });

      if (nextPagesSnapshot) {
        await persistPages(nextPagesSnapshot);
      }
    } catch {
      setStatus('error');
    } finally {
      setUploadingKey('');
    }
  }

  function save() {
    void persistPages(pages);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Edit Page</h2>
          <p className="text-sm text-gray-500">Update the selected page without leaving the dedicated editor screen.</p>
        </div>
        <Link href="/dashboard/b2b/pages" className="text-sm font-medium text-sky-700 hover:text-sky-800">
          Back to all pages
        </Link>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        <div className="rounded-2xl border border-gray-200 p-4 md:p-6 space-y-6 bg-gray-50/40">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-sky-600 font-semibold">{selectedPage.route}</p>
                <h3 className="text-xl font-semibold text-gray-900 mt-1">{selectedPage.title}</h3>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={selectedPage.published}
                  onChange={(event) => updatePage(selectedPage.route, (current) => ({ ...current, published: event.target.checked }))}
                />
                Published
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={selectedPage.route === '/' ? 'https://prag.global/' : `https://prag.global${selectedPage.route}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-800"
              >
                <ExternalLink size={16} />
                Preview Frontend Page
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1 md:col-span-2">
                <span className="text-sm font-medium text-gray-700">Page title</span>
                <input
                  className={inputCls}
                  value={selectedPage.title}
                  onChange={(event) => updatePage(selectedPage.route, (current) => ({ ...current, title: event.target.value }))}
                />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-sm font-medium text-gray-700">Description</span>
                <textarea
                  className={areaCls}
                  value={selectedPage.description}
                  onChange={(event) => updatePage(selectedPage.route, (current) => ({ ...current, description: event.target.value }))}
                />
              </label>
            </div>

            {selectedPage.route === '/installations' && (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
                Case study cards, categories, and installation process are managed in the Case Studies module.
                This page editor controls only the main installations content.
              </div>
            )}

            {selectedPage.route.startsWith('/solutions/') && (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
                Problem and solution items are managed in the Solutions module.
                This page editor controls only the main page content.
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-700">Sections</p>
                <span className="text-xs text-gray-500 uppercase tracking-wide">{selectedPage.sections.length} blocks</span>
              </div>
              <div className="space-y-4">
                {selectedPage.sections.map((section, index) => (
                  <div key={`${section.id}-${index}`} className="rounded-xl border border-gray-200 p-4 space-y-4 bg-white">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{section.type}</p>
                        <h4 className="text-base font-semibold text-gray-900 mt-1">{section.title || 'Untitled section'}</h4>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-gray-700">
                        <input
                          type="checkbox"
                          checked={section.visible}
                          onChange={(event) => updatePage(selectedPage.route, (current) => ({
                            ...current,
                            sections: current.sections.map((item, itemIndex) => itemIndex === index ? { ...item, visible: event.target.checked } : item),
                          }))}
                        />
                        Visible
                      </label>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
                      <div className="space-y-3">
                        <div className="relative h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                          <Image
                            src={section.imageUrl || emptyImage}
                            alt={section.imageAlt || section.title || 'Section preview'}
                            fill
                            className="object-cover"
                            sizes="280px"
                            unoptimized
                          />
                        </div>
                        <label className="space-y-1 block">
                          <span className="text-xs font-medium text-gray-600">Image URL</span>
                          <input
                            className={inputCls}
                            value={section.imageUrl ?? ''}
                            onChange={(event) => updatePage(selectedPage.route, (current) => ({
                              ...current,
                              sections: current.sections.map((item, itemIndex) => itemIndex === index ? { ...item, imageUrl: event.target.value } : item),
                            }))}
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-medium text-gray-600">Image alt text</span>
                          <input
                            className={inputCls}
                            value={section.imageAlt ?? ''}
                            onChange={(event) => updatePage(selectedPage.route, (current) => ({
                              ...current,
                              sections: current.sections.map((item, itemIndex) => itemIndex === index ? { ...item, imageAlt: event.target.value } : item),
                            }))}
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-xs text-gray-700 rounded-xl border border-dashed border-gray-300 p-3 bg-gray-50">
                          <span className="font-medium text-gray-700 inline-flex items-center gap-2"><ImagePlus size={14} /> Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingKey === `${selectedPage.route}-${index}`}
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) {
                                void handleImageUpload(selectedPage.route, index, file);
                              }
                            }}
                          />
                          {uploadingKey === `${selectedPage.route}-${index}` && <span className="text-sky-600">Uploading...</span>}
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="space-y-1 block">
                      <span className="text-xs font-medium text-gray-600">Title</span>
                      <input
                        className={inputCls}
                        value={section.title}
                        onChange={(event) => updatePage(selectedPage.route, (current) => ({
                          ...current,
                          sections: current.sections.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item),
                        }))}
                      />
                    </label>
                    <label className="space-y-1 block">
                      <span className="text-xs font-medium text-gray-600">Kicker / Eyebrow</span>
                      <input
                        className={inputCls}
                        value={section.kicker ?? ''}
                        onChange={(event) => updatePage(selectedPage.route, (current) => ({
                          ...current,
                          sections: current.sections.map((item, itemIndex) => itemIndex === index ? { ...item, kicker: event.target.value } : item),
                        }))}
                      />
                    </label>
                    <label className="space-y-1 block md:col-span-2">
                      <span className="text-xs font-medium text-gray-600">Summary / Headline</span>
                      <textarea
                        className={areaCls}
                        value={section.summary}
                        onChange={(event) => updatePage(selectedPage.route, (current) => ({
                          ...current,
                          sections: current.sections.map((item, itemIndex) => itemIndex === index ? { ...item, summary: event.target.value } : item),
                        }))}
                      />
                    </label>
                    <label className="space-y-1 block md:col-span-2">
                      <span className="text-xs font-medium text-gray-600">Body Content</span>
                      <textarea
                        className={`${areaCls} min-h-32`}
                        value={section.content ?? ''}
                        onChange={(event) => updatePage(selectedPage.route, (current) => ({
                          ...current,
                          sections: current.sections.map((item, itemIndex) => itemIndex === index ? { ...item, content: event.target.value } : item),
                        }))}
                      />
                    </label>
                    <label className="space-y-1 block">
                      <span className="text-xs font-medium text-gray-600">CTA Label</span>
                      <input
                        className={inputCls}
                        value={section.ctaLabel ?? ''}
                        onChange={(event) => updatePage(selectedPage.route, (current) => ({
                          ...current,
                          sections: current.sections.map((item, itemIndex) => itemIndex === index ? { ...item, ctaLabel: event.target.value } : item),
                        }))}
                      />
                    </label>
                    <label className="space-y-1 block">
                      <span className="text-xs font-medium text-gray-600">CTA Link</span>
                      <input
                        className={inputCls}
                        value={section.ctaHref ?? ''}
                        onChange={(event) => updatePage(selectedPage.route, (current) => ({
                          ...current,
                          sections: current.sections.map((item, itemIndex) => itemIndex === index ? { ...item, ctaHref: event.target.value } : item),
                        }))}
                      />
                    </label>
                    <label className="space-y-1 block">
                      <span className="text-xs font-medium text-gray-600">Secondary CTA Label</span>
                      <input
                        className={inputCls}
                        value={section.secondaryCtaLabel ?? ''}
                        onChange={(event) => updatePage(selectedPage.route, (current) => ({
                          ...current,
                          sections: current.sections.map((item, itemIndex) => itemIndex === index ? { ...item, secondaryCtaLabel: event.target.value } : item),
                        }))}
                      />
                    </label>
                    <label className="space-y-1 block">
                      <span className="text-xs font-medium text-gray-600">Secondary CTA Link</span>
                      <input
                        className={inputCls}
                        value={section.secondaryCtaHref ?? ''}
                        onChange={(event) => updatePage(selectedPage.route, (current) => ({
                          ...current,
                          sections: current.sections.map((item, itemIndex) => itemIndex === index ? { ...item, secondaryCtaHref: event.target.value } : item),
                        }))}
                      />
                    </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Pages'}
          </button>
          {status === 'success' && <span className="text-sm text-green-600">Pages saved successfully.</span>}
          {status === 'error' && <span className="text-sm text-red-600">Could not save pages.</span>}
        </div>
      </div>
    </div>
  );
}

