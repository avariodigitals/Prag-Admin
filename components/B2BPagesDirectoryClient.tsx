'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import type { B2BPageRecord } from '@/lib/b2bAdminStore';
import { encodeB2BPageId } from '@/lib/b2bPageRoute';

const emptyImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="%23eef2f7"/><text x="320" y="200" text-anchor="middle" fill="%23808a9a" font-size="24" font-family="Arial, sans-serif">No image selected</text></svg>';

export default function B2BPagesDirectoryClient({ initialPages }: { initialPages: B2BPageRecord[] }) {
  const publishedCount = useMemo(() => initialPages.filter((page) => page.published).length, [initialPages]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Pages</h2>
          <p className="text-sm text-gray-500">Select a page card to open a dedicated editor page.</p>
        </div>
        <div className="text-sm text-gray-500">
          {publishedCount} published of {initialPages.length}
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {initialPages.map((page) => {
            const heroImage = page.sections.find((section) => section.type === 'hero')?.imageUrl || page.sections.find((section) => section.imageUrl)?.imageUrl || emptyImage;
            return (
              <Link
                key={page.route}
                href={`/dashboard/b2b/pages/${encodeB2BPageId(page.route)}`}
                className="text-left rounded-2xl overflow-hidden border border-gray-200 transition-all hover:border-sky-300 hover:shadow-md"
              >
                <div className="relative h-40 bg-gray-100">
                  <Image src={heroImage} alt={page.title} fill className="object-cover" sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">{page.route}</p>
                      <h3 className="text-lg font-semibold text-white mt-1">{page.title}</h3>
                    </div>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${page.published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{page.published ? 'Published' : 'Draft'}</span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-sm text-gray-600 line-clamp-2">{page.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{page.sections.length} editable blocks</span>
                    <span>{page.sections.filter((section) => section.imageUrl).length} images set</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
