'use client';

import { useEffect, useState, useCallback, Fragment } from 'react';
import Link from 'next/link';
import { ChevronLeft, Eye, EyeOff, Loader2, ArrowUp, ArrowDown, Save, Pencil, Check, X } from 'lucide-react';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
  hidden: boolean;
  order: number;
}

export default function CategoryVisibilityClient({ token }: { token: string }) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [subcategoryOrder, setSubcategoryOrder] = useState<Record<string, string[]>>({});
  const [subOrderChanged, setSubOrderChanged] = useState(false);
  const [savingSubOrder, setSavingSubOrder] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/product-categories/visibility', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      setCategories(data.categories ?? []);
      setSubcategoryOrder(data.subcategory_order ?? {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function toggleCategory(slug: string, currentlyHidden: boolean) {
    setTogglingSlug(slug);
    try {
      const res = await fetch('/api/product-categories/visibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, hidden: !currentlyHidden }),
      });
      if (!res.ok) throw new Error('Failed to toggle category');
      setCategories((prev) =>
        prev.map((c) => (c.slug === slug ? { ...c, hidden: !currentlyHidden } : c))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle category');
    } finally {
      setTogglingSlug(null);
    }
  }

  const parentCategories = categories.filter((c) => c.parent === 0);
  const childMap = new Map<number, CategoryItem[]>();
  for (const c of categories) {
    if (c.parent !== 0) {
      const siblings = childMap.get(c.parent) ?? [];
      siblings.push(c);
      childMap.set(c.parent, siblings);
    }
  }

  const visibleCount = categories.filter((c) => !c.hidden).length;

  function moveCategory(index: number, direction: 'up' | 'down') {
    const newParents = [...parentCategories];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newParents.length) return;
    [newParents[index], newParents[swapIndex]] = [newParents[swapIndex], newParents[index]];
    // Rebuild full categories array in new order: parents interleaved with their children
    const reordered: CategoryItem[] = [];
    for (const parent of newParents) {
      reordered.push(parent);
      reordered.push(...(childMap.get(parent.id) ?? []));
    }
    // Append any categories not in parent list (shouldn't happen, but safety)
    const seen = new Set(reordered.map((c) => c.slug));
    for (const c of categories) {
      if (!seen.has(c.slug)) reordered.push(c);
    }
    setCategories(reordered);
    setOrderChanged(true);
  }

  async function saveOrder() {
    setSavingOrder(true);
    setError('');
    try {
      const newOrder = parentCategories.map((c) => c.slug);
      const res = await fetch('/api/product-categories/visibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_order: newOrder }),
      });
      if (!res.ok) throw new Error('Failed to save category order');
      setOrderChanged(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category order');
    } finally {
      setSavingOrder(false);
    }
  }

  function moveSubcategory(parentSlug: string, index: number, direction: 'up' | 'down') {
    const current = subcategoryOrder[parentSlug] ?? childMap.get(parentCategories.find(p => p.slug === parentSlug)?.id ?? -1)?.map(c => c.slug) ?? [];
    const newList = [...current];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newList.length) return;
    [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];
    setSubcategoryOrder((prev) => ({ ...prev, [parentSlug]: newList }));
    setSubOrderChanged(true);
  }

  async function saveSubOrder() {
    setSavingSubOrder(true);
    setError('');
    try {
      const res = await fetch('/api/product-categories/visibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subcategory_order: subcategoryOrder }),
      });
      if (!res.ok) throw new Error('Failed to save subcategory order');
      setSubOrderChanged(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subcategory order');
    } finally {
      setSavingSubOrder(false);
    }
  }

  function startRename(cat: CategoryItem) {
    setRenamingId(cat.id);
    setRenameValue(cat.name);
  }

  function cancelRename() {
    setRenamingId(null);
    setRenameValue('');
  }

  async function confirmRename(id: number) {
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    setRenaming(true);
    setError('');
    try {
      const res = await fetch('/api/product-categories/visibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rename: { id, name: trimmed } }),
      });
      if (!res.ok) throw new Error('Failed to rename category');
      setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name: trimmed } : c));
      setRenamingId(null);
      setRenameValue('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename category');
    } finally {
      setRenaming(false);
    }
  }
  const hiddenCount = categories.filter((c) => c.hidden).length;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-2">
          <ChevronLeft size={16} />
          Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Category Visibility & Order</h1>
        <p className="text-gray-500 text-sm mt-1">
          Toggle product categories on or off, and rearrange their display order on the storefront.
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
            <Eye size={14} /> {visibleCount} visible
          </span>
          <span className="inline-flex items-center gap-1.5 text-gray-400 font-medium">
            <EyeOff size={14} /> {hiddenCount} hidden
          </span>
          <span className="text-gray-400">{categories.length} total</span>
          {orderChanged && (
            <button
              onClick={saveOrder}
              disabled={savingOrder}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-800 disabled:opacity-50"
            >
              {savingOrder ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              Save Order
            </button>
          )}
          {subOrderChanged && (
            <button
              onClick={saveSubOrder}
              disabled={savingSubOrder}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-800 disabled:opacity-50"
            >
              {savingSubOrder ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              Save Subcategory Order
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {parentCategories.length === 0
                  ? <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No categories found</td></tr>
                  : parentCategories.map((cat, parentIndex) => {
                      const children = childMap.get(cat.id) ?? [];
                      const subOrder = subcategoryOrder[cat.slug] ?? children.map(c => c.slug);
                      const orderedChildren = subOrder
                        .map(slug => children.find(c => c.slug === slug))
                        .filter((c): c is CategoryItem => Boolean(c));
                      // Append any children not in subOrder
                      const seenSlugs = new Set(orderedChildren.map(c => c.slug));
                      for (const c of children) {
                        if (!seenSlugs.has(c.slug)) orderedChildren.push(c);
                      }
                      return (
                        <Fragment key={cat.slug}>
                          <CategoryRow
                            cat={cat}
                            toggling={togglingSlug === cat.slug}
                            onToggle={() => toggleCategory(cat.slug, cat.hidden)}
                            showOrderControls
                            canMoveUp={parentIndex > 0}
                            canMoveDown={parentIndex < parentCategories.length - 1}
                            onMoveUp={() => moveCategory(parentIndex, 'up')}
                            onMoveDown={() => moveCategory(parentIndex, 'down')}
                            displayIndex={parentIndex + 1}
                            isRenaming={renamingId === cat.id}
                            renameValue={renameValue}
                            onRenameChange={setRenameValue}
                            onConfirmRename={() => confirmRename(cat.id)}
                            onCancelRename={cancelRename}
                            onStartRename={() => startRename(cat)}
                            renaming={renaming}
                          />
                          {orderedChildren.map((child, childIndex) => (
                            <CategoryRow
                              key={child.slug}
                              cat={child}
                              isChild
                              toggling={togglingSlug === child.slug}
                              onToggle={() => toggleCategory(child.slug, child.hidden)}
                              showOrderControls
                              canMoveUp={childIndex > 0}
                              canMoveDown={childIndex < orderedChildren.length - 1}
                              onMoveUp={() => moveSubcategory(cat.slug, childIndex, 'up')}
                              onMoveDown={() => moveSubcategory(cat.slug, childIndex, 'down')}
                              displayIndex={childIndex + 1}
                              isRenaming={renamingId === child.id}
                              renameValue={renameValue}
                              onRenameChange={setRenameValue}
                              onConfirmRename={() => confirmRename(child.id)}
                              onCancelRename={cancelRename}
                              onStartRename={() => startRename(child)}
                              renaming={renaming}
                            />
                          ))}
                        </Fragment>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryRow({
  cat,
  isChild,
  toggling,
  onToggle,
  showOrderControls,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  displayIndex,
  isRenaming,
  renameValue,
  onRenameChange,
  onConfirmRename,
  onCancelRename,
  onStartRename,
  renaming,
}: {
  cat: CategoryItem;
  isChild?: boolean;
  toggling: boolean;
  onToggle: () => void;
  showOrderControls?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  displayIndex?: number;
  isRenaming?: boolean;
  renameValue?: string;
  onRenameChange?: (v: string) => void;
  onConfirmRename?: () => void;
  onCancelRename?: () => void;
  onStartRename?: () => void;
  renaming?: boolean;
}) {
  return (
    <tr className={`hover:bg-gray-50 transition-colors ${isChild ? 'bg-gray-50/50' : ''}`}>
      <td className="px-4 py-4">
        {showOrderControls ? (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-400 w-5">{displayIndex}</span>
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move up"
            >
              <ArrowUp size={14} />
            </button>
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move down"
            >
              <ArrowDown size={14} />
            </button>
          </div>
        ) : null}
      </td>
      <td className="px-6 py-4">
        <div className={`flex items-center gap-2 ${isChild ? 'pl-6' : ''}`}>
          {isChild && <span className="text-gray-300">↳</span>}
          {isRenaming ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => onRenameChange?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onConfirmRename?.();
                  if (e.key === 'Escape') onCancelRename?.();
                }}
                autoFocus
                className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                onClick={onConfirmRename}
                disabled={renaming}
                className="p-1 rounded hover:bg-green-100 text-green-600 disabled:opacity-50"
                title="Confirm rename"
              >
                {renaming ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
              </button>
              <button
                onClick={onCancelRename}
                disabled={renaming}
                className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-50"
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <span className={`font-medium ${cat.hidden ? 'text-gray-400' : 'text-gray-900'}`}>{cat.name}</span>
              <button
                onClick={onStartRename}
                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                title="Rename"
              >
                <Pencil size={12} />
              </button>
            </>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-xs font-mono text-gray-500">{cat.slug}</td>
      <td className="px-6 py-4 text-xs text-gray-500">{cat.count}</td>
      <td className="px-6 py-4">
        <button
          onClick={onToggle}
          disabled={toggling}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            cat.hidden ? 'bg-gray-200' : 'bg-green-500'
          } ${toggling ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
        >
          {toggling ? (
            <Loader2 className="absolute left-1 animate-spin text-white" size={14} />
          ) : (
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                cat.hidden ? 'translate-x-1' : 'translate-x-6'
              }`}
            />
          )}
        </button>
        <span className={`ml-2 text-xs font-medium ${cat.hidden ? 'text-gray-400' : 'text-green-600'}`}>
          {cat.hidden ? 'Hidden' : 'Visible'}
        </span>
      </td>
    </tr>
  );
}
