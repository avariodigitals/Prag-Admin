'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ImagePlus, Library, Save, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';
import { revalidateFrontend } from '@/lib/revalidateFrontend';
import type { B2CPageRecord, B2CPageSection } from '@/lib/adminStore';

const inputCls = 'w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500';
const areaCls = 'w-full min-h-20 p-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500';
const emptyImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="%23eef2f7"/><text x="320" y="200" text-anchor="middle" fill="%23808a9a" font-size="24" font-family="Arial, sans-serif">No image selected</text></svg>';

const SECTION_TYPES = ['hero', 'content', 'cta', 'stats', 'values', 'cards', 'faq'] as const;

function createSection(type: string, route: string): B2CPageSection {
  return {
    id: `${route}-${type}-${Date.now()}`,
    title: type.charAt(0).toUpperCase() + type.slice(1),
    type,
    visible: true,
    summary: '',
    content: '',
    kicker: '',
    ctaLabel: '',
    ctaHref: '',
    imageUrl: '',
    imageAlt: '',
  };
}

export default function B2CPagesClient({ initialPages, selectedRoute }: { initialPages: B2CPageRecord[]; selectedRoute: string }) {
  const [pages, setPages] = useState(initialPages);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const mediaPickerCallback = useRef<((url: string) => void) | null>(null);

  function openMediaPicker(callback: (url: string) => void) {
    mediaPickerCallback.current = callback;
    setMediaPickerOpen(true);
  }

  const selectedPage = pages.find((page) => page.route === selectedRoute) ?? null;

  if (!selectedPage) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">Page not found</h2>
        <p className="text-sm text-gray-500 mt-2">The selected page could not be loaded.</p>
        <Link href="/dashboard/pages" className="inline-flex mt-4 text-sm font-medium text-amber-700 hover:text-amber-800">
          Back to all pages
        </Link>
      </div>
    );
  }

  function updatePage(route: string, updater: (page: B2CPageRecord) => B2CPageRecord) {
    setPages((current) => current.map((page) => (page.route === route ? updater(page) : page)));
  }

  async function persistPages(nextPages: B2CPageRecord[]) {
    setSaving(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/admin/b2c-pages', {
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
        setPages(data.pages as B2CPageRecord[]);
      }
      // Revalidate the B2C frontend so changes appear immediately
      try {
        await revalidateFrontend({
          paths: ['/distributor', '/about', '/contact', '/faq', '/stores', '/knowledge-center', '/'],
          tags: ['b2c-public-content'],
        });
      } catch {
        // revalidation failure doesn't mean save failed
      }
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  function save() {
    void persistPages(pages);
  }

  function addSection(type: string) {
    if (!selectedPage) return;
    const newSection = createSection(type, selectedPage.route);
    updatePage(selectedPage.route, (current) => ({
      ...current,
      sections: [...current.sections, newSection],
    }));
  }

  function deleteSection(index: number) {
    if (!selectedPage) return;
    updatePage(selectedPage.route, (current) => ({
      ...current,
      sections: current.sections.filter((_, i) => i !== index),
    }));
  }

  function moveSection(index: number, direction: 'up' | 'down') {
    if (!selectedPage) return;
    updatePage(selectedPage.route, (current) => {
      const sections = [...current.sections];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sections.length) return current;
      [sections[index], sections[targetIndex]] = [sections[targetIndex], sections[index]];
      return { ...current, sections };
    });
  }

  const frontendBase = process.env.NEXT_PUBLIC_SHOP_URL || 'https://shop.prag.global';

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Page</h2>
            <p className="text-sm text-gray-500">Section-based editor for the brand-site page.</p>
          </div>
          <Link href="/dashboard/pages" className="text-sm font-medium text-amber-700 hover:text-amber-800">
            Back to all pages
          </Link>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          <div className="rounded-2xl border border-gray-200 p-4 md:p-6 space-y-6 bg-gray-50/40">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber-600 font-semibold">{selectedPage.route}</p>
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
                href={selectedPage.route === '/' ? `${frontendBase}/` : `${frontendBase}${selectedPage.route}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800"
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

            {/* Sections */}
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
                      <div className="flex items-center gap-3">
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
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveSection(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(index, 'down')}
                            disabled={index === selectedPage.sections.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSection(index)}
                            className="p-1 text-red-400 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
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
                        <button type="button" onClick={() => openMediaPicker((url) => {
                          updatePage(selectedPage.route, (current) => ({
                            ...current,
                            sections: current.sections.map((item, itemIndex) => itemIndex === index ? { ...item, imageUrl: url } : item),
                          }));
                        })}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                          <Library size={14} /> Media Library
                        </button>
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

              {/* Add section buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-sm font-medium text-gray-700">Add section:</span>
                {SECTION_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => addSection(type)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                  >
                    <Plus size={12} /> {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Save bar */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {status === 'success' && <span className="text-sm text-green-600">Saved successfully</span>}
                {status === 'error' && <span className="text-sm text-red-600">Save failed — try again</span>}
              </div>
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Page'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mediaPickerOpen && (
        <MediaPicker
          open={mediaPickerOpen}
          onClose={() => setMediaPickerOpen(false)}
          multiple={false}
          onSelect={(items) => {
            if (items[0] && mediaPickerCallback.current) {
              mediaPickerCallback.current(items[0].source_url);
            }
            setMediaPickerOpen(false);
          }}
        />
      )}
    </>
  );
}
