'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Save, Trash2, Library } from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';
import type { B2BSolutionsContent, B2BSolutionBodyOverrideMap, B2BSolutionBodyOverride, B2BSolutionBodySection, B2BSolutionBodyFaq } from '@/lib/b2bAdminStore';

const inputCls = 'w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';
const areaCls = 'w-full min-h-24 p-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';

interface CatalogProduct {
  id: number;
  name: string;
  slug: string;
  categories: Array<{ id: number; name: string; slug: string }>;
}

interface CatalogCategory {
  id: number;
  name: string;
  slug: string;
}

function makeProblem(key: string, nextIndex: number) {
  return {
    id: `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: '',
    body: '',
    impact: [''],
    solution: [''],
    imageUrl: '',
    technologies: [''],
    productIds: [],
    productCategories: [''],
    active: true,
  };
}

function makeCategory(): B2BSolutionsContent['categories'][number] {
  const key = `category-${Date.now()}`;
  return {
    key,
    label: 'New Category',
    route: `/solutions/${key}`,
    heroTitle: '',
    heroDescription: '',
    ctaLabel: '',
    ctaHref: '',
    secondaryCtaLabel: '',
    secondaryCtaHref: '',
    problems: [],
  };
}

export default function B2BSolutionsClient({ initialSolutions, initialSolutionBodies }: { initialSolutions: B2BSolutionsContent; initialSolutionBodies?: B2BSolutionBodyOverrideMap }) {
  const [data, setData] = useState<B2BSolutionsContent>(initialSolutions);
  const [solutionBodies, setSolutionBodies] = useState<B2BSolutionBodyOverrideMap>(initialSolutionBodies ?? {});
  const [activeCategory, setActiveCategory] = useState<string>(initialSolutions.categories[0]?.key ?? '');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const mediaPickerCallback = useRef<((url: string) => void) | null>(null);

  function openMediaPicker(callback: (url: string) => void) {
    mediaPickerCallback.current = callback;
    setMediaPickerOpen(true);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      try {
        const res = await fetch('/api/admin/b2b/solutions/catalog', { cache: 'no-store' });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok || cancelled) return;

        setCatalogProducts(Array.isArray(payload?.products) ? payload.products : []);
        setCatalogCategories(Array.isArray(payload?.categories) ? payload.categories : []);
      } finally {
        if (!cancelled) setLoadingCatalog(false);
      }
    }

    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoriesByKey = useMemo(() => {
    return new Map(data.categories.map((category) => [category.key, category]));
  }, [data.categories]);

  const category = categoriesByKey.get(activeCategory) ?? data.categories[0];

  const filteredCatalogProducts = useMemo(() => {
    const needle = productSearch.trim().toLowerCase();
    if (!needle) return catalogProducts;
    return catalogProducts.filter((product) => (
      product.name.toLowerCase().includes(needle)
      || product.slug.toLowerCase().includes(needle)
    ));
  }, [catalogProducts, productSearch]);

  function updateCategory(updater: (current: typeof category) => typeof category) {
    if (!category) return;
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((item) => (item.key === activeCategory ? updater(item) : item)),
    }));
  }

  function addCategory() {
    const next = makeCategory();
    setData((prev) => ({ ...prev, categories: [...prev.categories, next] }));
    setActiveCategory(next.key);
  }

  function deleteCategory(key: string) {
    setData((prev) => {
      const remaining = prev.categories.filter((item) => item.key !== key);
      return { ...prev, categories: remaining };
    });
    setActiveCategory((prev) => {
      const remaining = data.categories.filter((item) => item.key !== key);
      if (remaining.length === 0) return '';
      return remaining[0]?.key ?? '';
    });
  }

  function syncProblemProductCategories(problemIds: number[]) {
    const slugs = new Set<string>();
    for (const productId of problemIds) {
      const product = catalogProducts.find((item) => item.id === productId);
      if (!product) continue;
      for (const category of product.categories) {
        if (category.slug) slugs.add(category.slug);
      }
    }
    return Array.from(slugs);
  }

  async function save() {
    setSaving(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/admin/b2b/solutions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solutions: data, solutionBodies }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || 'Failed to save solutions');

      setData(payload.solutions || data);
      setSolutionBodies(payload.solutionBodies || solutionBodies);
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  if (!category) return null;

  return (
    <>
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Solution Categories</h2>
          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.categories.map((tab) => {
            const key = tab.key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border ${activeCategory === key ? 'bg-sky-700 text-white border-sky-700' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
              >
                {tab.label || 'Untitled'}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); deleteCategory(key); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); deleteCategory(key); } }}
                  className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-white/20 text-[10px] leading-none cursor-pointer"
                  title="Delete category"
                >
                  ×
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{category.label || 'Untitled'} Page Content</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Category key</span>
            <input
              className={inputCls}
              value={category.key}
              onChange={(event) => {
                const newKey = event.target.value.trim();
                setData((prev) => ({
                  ...prev,
                  categories: prev.categories.map((item) => (item.key === activeCategory ? { ...item, key: newKey } : item)),
                }));
                setActiveCategory(newKey);
              }}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Category label</span>
            <input className={inputCls} value={category.label} onChange={(event) => updateCategory((current) => ({ ...current, label: event.target.value }))} />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Route</span>
            <input className={inputCls} value={category.route} onChange={(event) => updateCategory((current) => ({ ...current, route: event.target.value }))} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Hero title</span>
            <input className={inputCls} value={category.heroTitle} onChange={(event) => updateCategory((current) => ({ ...current, heroTitle: event.target.value }))} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Hero description</span>
            <textarea className={areaCls} value={category.heroDescription} onChange={(event) => updateCategory((current) => ({ ...current, heroDescription: event.target.value }))} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Primary CTA label</span>
            <input className={inputCls} value={category.ctaLabel} onChange={(event) => updateCategory((current) => ({ ...current, ctaLabel: event.target.value }))} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Primary CTA href</span>
            <input className={inputCls} value={category.ctaHref} onChange={(event) => updateCategory((current) => ({ ...current, ctaHref: event.target.value }))} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Secondary CTA label</span>
            <input className={inputCls} value={category.secondaryCtaLabel} onChange={(event) => updateCategory((current) => ({ ...current, secondaryCtaLabel: event.target.value }))} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Secondary CTA href</span>
            <input className={inputCls} value={category.secondaryCtaHref} onChange={(event) => updateCategory((current) => ({ ...current, secondaryCtaHref: event.target.value }))} />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{category.label} Problems & Solutions</h2>
          <button
            type="button"
            onClick={() => updateCategory((current) => ({
              ...current,
              problems: [...current.problems, makeProblem(current.key, current.problems.length + 1)],
            }))}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Plus size={16} />
            Add Problem
          </button>
        </div>

        <div className="space-y-4">
          {category.problems.map((problem, index) => (
            <div key={problem.id} className="rounded-xl border border-gray-200 p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Item {index + 1}</p>
                  <h3 className="text-base font-semibold text-gray-900">{problem.title || 'Untitled problem'}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateCategory((current) => ({
                      ...current,
                      problems: current.problems.map((entry, entryIndex) => entryIndex === index ? { ...entry, active: !entry.active } : entry),
                    }))}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border ${problem.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                  >
                    {problem.active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => updateCategory((current) => {
                      const copy = [...current.problems];
                      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
                      return { ...current, problems: copy };
                    })}
                    className="px-2 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-sky-700 disabled:opacity-40"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={index >= category.problems.length - 1}
                    onClick={() => updateCategory((current) => {
                      const copy = [...current.problems];
                      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
                      return { ...current, problems: copy };
                    })}
                    className="px-2 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-sky-700 disabled:opacity-40"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCategory((current) => ({
                      ...current,
                      problems: current.problems.filter((_, entryIndex) => entryIndex !== index),
                    }))}
                    className="px-2 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Problem title</span>
                  <input className={inputCls} value={problem.title} onChange={(event) => updateCategory((current) => ({
                    ...current,
                    problems: current.problems.map((entry, entryIndex) => entryIndex === index ? { ...entry, title: event.target.value } : entry),
                  }))} />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Problem body</span>
                  <textarea className={areaCls} value={problem.body} onChange={(event) => updateCategory((current) => ({
                    ...current,
                    problems: current.problems.map((entry, entryIndex) => entryIndex === index ? { ...entry, body: event.target.value } : entry),
                  }))} />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Image URL</span>
                  <div className="flex gap-2">
                    <input className={inputCls} value={problem.imageUrl} onChange={(event) => updateCategory((current) => ({
                      ...current,
                      problems: current.problems.map((entry, entryIndex) => entryIndex === index ? { ...entry, imageUrl: event.target.value } : entry),
                    }))} />
                    <button type="button" onClick={() => openMediaPicker((url) => updateCategory((current) => ({
                      ...current,
                      problems: current.problems.map((entry, entryIndex) => entryIndex === index ? { ...entry, imageUrl: url } : entry),
                    })))}
                      className="inline-flex items-center gap-2 px-3 h-10 shrink-0 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <Library size={14} /> Library
                    </button>
                  </div>
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium text-gray-700">Impact (one per line)</span>
                  <textarea className={areaCls} value={problem.impact.join('\n')} onChange={(event) => updateCategory((current) => ({
                    ...current,
                    problems: current.problems.map((entry, entryIndex) => entryIndex === index
                      ? { ...entry, impact: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) }
                      : entry),
                  }))} />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium text-gray-700">Solution (one per line)</span>
                  <textarea className={areaCls} value={problem.solution.join('\n')} onChange={(event) => updateCategory((current) => ({
                    ...current,
                    problems: current.problems.map((entry, entryIndex) => entryIndex === index
                      ? { ...entry, solution: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) }
                      : entry),
                  }))} />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium text-gray-700">Technologies (one per line)</span>
                  <textarea className={areaCls} value={problem.technologies.join('\n')} onChange={(event) => updateCategory((current) => ({
                    ...current,
                    problems: current.problems.map((entry, entryIndex) => entryIndex === index
                      ? { ...entry, technologies: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) }
                      : entry),
                  }))} />
                </label>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-700">Derived Product Categories</span>
                  <div className="min-h-24 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600">
                    {problem.productCategories.length > 0 ? problem.productCategories.join(', ') : 'No categories yet. Select products below to auto-populate categories.'}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-gray-900">Product Selection</h4>
                  <span className="text-xs text-gray-500">{(problem.productIds ?? []).length} selected</span>
                </div>

                <input
                  className={inputCls}
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Search products by name or slug"
                />

                {loadingCatalog ? (
                  <p className="text-sm text-gray-500">Loading catalog...</p>
                ) : (
                  <div className="max-h-56 overflow-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                    {filteredCatalogProducts.slice(0, 60).map((product) => {
                      const checked = (problem.productIds ?? []).includes(product.id);
                      return (
                        <label key={product.id} className="flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => updateCategory((current) => {
                              const next = current.problems.map((entry, entryIndex) => {
                                if (entryIndex !== index) return entry;
                                const currentIds = Array.isArray(entry.productIds) ? entry.productIds : [];
                                const nextIds = event.target.checked
                                  ? Array.from(new Set([...currentIds, product.id]))
                                  : currentIds.filter((id) => id !== product.id);

                                return {
                                  ...entry,
                                  productIds: nextIds,
                                  productCategories: syncProblemProductCategories(nextIds),
                                };
                              });

                              return { ...current, problems: next };
                            })}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-500 truncate">{product.slug}</p>
                            {product.categories.length > 0 && (
                              <p className="text-xs text-gray-400 truncate">
                                {product.categories.map((item) => item.slug).join(', ')}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                    {filteredCatalogProducts.length === 0 && (
                      <p className="px-3 py-3 text-sm text-gray-500">No products match this search.</p>
                    )}
                  </div>
                )}

                {(problem.productIds ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(problem.productIds ?? []).map((productId) => {
                      const selected = catalogProducts.find((item) => item.id === productId);
                      const label = selected ? selected.name : `Product #${productId}`;
                      return (
                        <button
                          key={productId}
                          type="button"
                          onClick={() => updateCategory((current) => ({
                            ...current,
                            problems: current.problems.map((entry, entryIndex) => {
                              if (entryIndex !== index) return entry;
                              const currentIds = Array.isArray(entry.productIds) ? entry.productIds : [];
                              const nextIds = currentIds.filter((id) => id !== productId);
                              return {
                                ...entry,
                                productIds: nextIds,
                                productCategories: syncProblemProductCategories(nextIds),
                              };
                            }),
                          }))}
                          className="px-2.5 py-1 rounded-full border border-sky-200 text-sky-700 text-xs hover:bg-sky-50"
                        >
                          {label} ×
                        </button>
                      );
                    })}
                  </div>
                )}

                {catalogCategories.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Categories auto-derived from selected products and saved for fallback matching.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Body Sections + FAQs Editor */}
      <SolutionBodyEditor
        categoryKey={category.key}
        solutionBodies={solutionBodies}
        setSolutionBodies={setSolutionBodies}
      />

      <div className="sticky bottom-4 z-10">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Solutions'}
          </button>
          {status === 'success' && <span className="text-sm text-green-600">Solutions saved successfully.</span>}
          {status === 'error' && <span className="text-sm text-red-600">Failed to save solutions.</span>}
        </div>
      </div>
    </div>

      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        multiple={false}
        onSelect={(items) => {
          if (items[0] && mediaPickerCallback.current) {
            mediaPickerCallback.current(items[0].source_url);
          }
        }}
      />
    </>
  );
}

function makeSection(): B2BSolutionBodySection {
  return { id: `section-${Date.now()}`, heading: '', body: '', list: [] };
}

function makeFaq(): B2BSolutionBodyFaq {
  return { question: '', answer: '' };
}

function SolutionBodyEditor({
  categoryKey,
  solutionBodies,
  setSolutionBodies,
}: {
  categoryKey: string;
  solutionBodies: B2BSolutionBodyOverrideMap;
  setSolutionBodies: React.Dispatch<React.SetStateAction<B2BSolutionBodyOverrideMap>>;
}) {
  const body: B2BSolutionBodyOverride = solutionBodies[categoryKey] ?? { sections: [], faqs: [] };

  function updateBody(updater: (current: B2BSolutionBodyOverride) => B2BSolutionBodyOverride) {
    setSolutionBodies((prev) => {
      const current = prev[categoryKey] ?? { sections: [], faqs: [] };
      const next = updater(current);
      const hasContent = next.sections.length > 0 || next.faqs.length > 0;
      const result = { ...prev };
      if (hasContent) {
        result[categoryKey] = next;
      } else {
        delete result[categoryKey];
      }
      return result;
    });
  }

  function addSection() {
    updateBody((current) => ({ ...current, sections: [...current.sections, makeSection()] }));
  }

  function updateSection(index: number, patch: Partial<B2BSolutionBodySection>) {
    updateBody((current) => ({
      ...current,
      sections: current.sections.map((section, i) => (i === index ? { ...section, ...patch } : section)),
    }));
  }

  function deleteSection(index: number) {
    updateBody((current) => ({
      ...current,
      sections: current.sections.filter((_, i) => i !== index),
    }));
  }

  function moveSection(index: number, direction: -1 | 1) {
    updateBody((current) => {
      const copy = [...current.sections];
      const target = index + direction;
      if (target < 0 || target >= copy.length) return current;
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return { ...current, sections: copy };
    });
  }

  function addFaq() {
    updateBody((current) => ({ ...current, faqs: [...current.faqs, makeFaq()] }));
  }

  function updateFaq(index: number, patch: Partial<B2BSolutionBodyFaq>) {
    updateBody((current) => ({
      ...current,
      faqs: current.faqs.map((faq, i) => (i === index ? { ...faq, ...patch } : faq)),
    }));
  }

  function deleteFaq(index: number) {
    updateBody((current) => ({
      ...current,
      faqs: current.faqs.filter((_, i) => i !== index),
    }));
  }

  function moveFaq(index: number, direction: -1 | 1) {
    updateBody((current) => {
      const copy = [...current.faqs];
      const target = index + direction;
      if (target < 0 || target >= copy.length) return current;
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return { ...current, faqs: copy };
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Body Content (Sections & FAQs)</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Edits the content that appears after the cards on the <code className="text-xs bg-gray-100 px-1 rounded">/{categoryKey}</code> solutions page.
            Leave empty to use the default hardcoded content.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Body Sections</h3>
          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Plus size={14} />
            Add Section
          </button>
        </div>

        {body.sections.length === 0 && (
          <p className="text-sm text-gray-400 italic py-4 text-center border border-dashed border-gray-200 rounded-lg">
            No custom sections — the default hardcoded content will be used.
          </p>
        )}

        {body.sections.map((section, index) => (
          <div key={section.id ?? index} className="rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Section {index + 1}</p>
              <div className="flex items-center gap-2">
                <button type="button" disabled={index === 0} onClick={() => moveSection(index, -1)} className="px-2 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-sky-700 disabled:opacity-40">
                  <ArrowUp size={14} />
                </button>
                <button type="button" disabled={index >= body.sections.length - 1} onClick={() => moveSection(index, 1)} className="px-2 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-sky-700 disabled:opacity-40">
                  <ArrowDown size={14} />
                </button>
                <button type="button" onClick={() => deleteSection(index)} className="px-2 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">Heading</span>
              <input className={inputCls} value={section.heading} onChange={(e) => updateSection(index, { heading: e.target.value })} placeholder="Section heading" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">Body text</span>
              <textarea className={areaCls} value={section.body} onChange={(e) => updateSection(index, { body: e.target.value })} placeholder="Paragraph text for this section" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">Bullet list items (one per line, optional)</span>
              <textarea className={areaCls} value={(section.list ?? []).join('\n')} onChange={(e) => updateSection(index, { list: e.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })} placeholder="One item per line" />
            </label>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">FAQs</h3>
          <button
            type="button"
            onClick={addFaq}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Plus size={14} />
            Add FAQ
          </button>
        </div>

        {body.faqs.length === 0 && (
          <p className="text-sm text-gray-400 italic py-4 text-center border border-dashed border-gray-200 rounded-lg">
            No custom FAQs — the default hardcoded FAQs will be used.
          </p>
        )}

        {body.faqs.map((faq, index) => (
          <div key={index} className="rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">FAQ {index + 1}</p>
              <div className="flex items-center gap-2">
                <button type="button" disabled={index === 0} onClick={() => moveFaq(index, -1)} className="px-2 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-sky-700 disabled:opacity-40">
                  <ArrowUp size={14} />
                </button>
                <button type="button" disabled={index >= body.faqs.length - 1} onClick={() => moveFaq(index, 1)} className="px-2 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-sky-700 disabled:opacity-40">
                  <ArrowDown size={14} />
                </button>
                <button type="button" onClick={() => deleteFaq(index)} className="px-2 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">Question</span>
              <input className={inputCls} value={faq.question} onChange={(e) => updateFaq(index, { question: e.target.value })} placeholder="FAQ question" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">Answer</span>
              <textarea className={areaCls} value={faq.answer} onChange={(e) => updateFaq(index, { answer: e.target.value })} placeholder="FAQ answer" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
