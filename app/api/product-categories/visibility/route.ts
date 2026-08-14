import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { appendAuditLog } from '@/lib/adminStore';
import { revalidateCategories } from '@/lib/revalidateFrontend';

const WC = `${process.env.NEXT_PUBLIC_WP_API_URL?.replace('/wp-json', '/wp-json/wc/v3') ?? 'https://central.prag.global/wp-json/wc/v3'}`;
const AUTH = `consumer_key=${process.env.WC_CONSUMER_KEY}&consumer_secret=${process.env.WC_CONSUMER_SECRET}`;
const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://central.prag.global/wp-json';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [catRes, settingsRes] = await Promise.all([
    fetch(`${WC}/products/categories?per_page=100&orderby=name&order=asc&${AUTH}`, { cache: 'no-store' }),
    fetch(`${WP_API_URL}/prag-core/v1/settings`, { cache: 'no-store' }),
  ]);

  if (!catRes.ok) return NextResponse.json({ error: 'Failed to load categories' }, { status: catRes.status });

  const categories = await catRes.json();
  const settings = settingsRes.ok ? await settingsRes.json() : {};
  const hidden: string[] = Array.isArray(settings.hidden_categories) ? settings.hidden_categories : [];
  const order: string[] = Array.isArray(settings.category_order) ? settings.category_order : [];

  const result = categories.map((c: { id: number; name: string; slug: string; count: number; parent: number }) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    count: c.count,
    parent: c.parent,
    hidden: hidden.includes(c.slug),
    order: order.indexOf(c.slug),
  }));

  const subcategoryOrder: Record<string, string[]> = settings.subcategory_order && typeof settings.subcategory_order === 'object' ? settings.subcategory_order : {};

  // Sort: categories in category_order first (in that order), then remaining by name
  result.sort((a: { order: number; name: string; parent: number; slug: string }, b: { order: number; name: string; parent: number; slug: string }) => {
    if (a.parent === 0 && b.parent === 0) {
      if (a.order !== -1 && b.order !== -1) return a.order - b.order;
      if (a.order !== -1) return -1;
      if (b.order !== -1) return 1;
      return a.name.localeCompare(b.name);
    }
    // Sort children by subcategory_order within their parent
    if (a.parent !== 0 && b.parent !== 0 && a.parent === b.parent) {
      const parentCat = result.find((p: { id: number }) => p.id === a.parent);
      const parentSlug = parentCat?.slug ?? '';
      const subOrder = subcategoryOrder[parentSlug] ?? [];
      const aSub = subOrder.indexOf(a.slug);
      const bSub = subOrder.indexOf(b.slug);
      if (aSub !== -1 && bSub !== -1) return aSub - bSub;
      if (aSub !== -1) return -1;
      if (bSub !== -1) return 1;
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return NextResponse.json({ categories: result, hidden, category_order: order, subcategory_order: subcategoryOrder });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { slug, hidden, category_order, subcategory_order, rename } = body;

  // Handle category rename via WooCommerce API
  if (rename && typeof rename.id === 'number' && typeof rename.name === 'string') {
    const wcRes = await fetch(`${WC}/products/categories/${rename.id}?${AUTH}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: rename.name }),
      cache: 'no-store',
    });
    if (!wcRes.ok) {
      const errText = await wcRes.text().catch(() => '');
      return NextResponse.json({ error: 'Failed to rename category', detail: errText }, { status: wcRes.status });
    }
    const updated = await wcRes.json();
    const newSlug = updated.slug ?? slug;

    // Sync the renamed category into settings.categories so the storefront
    // CategoryGrid (which reads from prag-core/v1/settings) reflects the change.
    try {
      const settingsRes2 = await fetch(`${WP_API_URL}/prag-core/v1/settings`, { cache: 'no-store' });
      if (settingsRes2.ok) {
        const currentSettings = await settingsRes2.json();
        const currentCats: Array<{ name: string; slug: string; image: string }> =
          Array.isArray(currentSettings.categories) ? currentSettings.categories : [];
        const updatedCats = currentCats.map((c) =>
          c.slug === slug ? { ...c, name: rename.name, slug: newSlug } : c
        );
        await fetch(`${WP_API_URL}/prag-core/v1/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
          body: JSON.stringify({ categories: updatedCats }),
          cache: 'no-store',
        });
      }
    } catch {
      // Non-fatal: WC rename succeeded, settings sync is best-effort
    }

    await appendAuditLog({
      actorEmail: session.user?.user_email ?? 'unknown',
      action: 'category.rename',
      target: `category:${newSlug}`,
      details: `Renamed category to "${rename.name}"`,
    });
    // Trigger revalidation on both frontends
    await revalidateCategories();
    return NextResponse.json({ success: true, id: rename.id, name: rename.name, slug: newSlug });
  }

  // Handle subcategory order update
  if (subcategory_order && typeof subcategory_order === 'object' && !Array.isArray(subcategory_order)) {
    const saveRes = await fetch(`${WP_API_URL}/prag-core/v1/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ subcategory_order }),
      cache: 'no-store',
    });
    if (!saveRes.ok) return NextResponse.json({ error: 'Failed to update subcategory order' }, { status: saveRes.status });
    await appendAuditLog({
      actorEmail: session.user?.user_email ?? 'unknown',
      action: 'category.subcategory_reorder',
      target: 'subcategories',
      details: `Updated subcategory order`,
    });
    // Trigger revalidation on both frontends
    await revalidateCategories();
    return NextResponse.json({ success: true, subcategory_order });
  }

  // Handle category order update
  if (Array.isArray(category_order)) {
    const saveRes = await fetch(`${WP_API_URL}/prag-core/v1/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ category_order }),
      cache: 'no-store',
    });

    if (!saveRes.ok) return NextResponse.json({ error: 'Failed to update category order' }, { status: saveRes.status });

    await appendAuditLog({
      actorEmail: session.user?.user_email ?? 'unknown',
      action: 'category.reorder',
      target: 'categories',
      details: `Reordered categories: ${category_order.join(', ')}`,
    });

    // Trigger revalidation on both frontends
    await revalidateCategories();

    return NextResponse.json({ success: true, category_order });
  }

  // Handle visibility toggle
  if (!slug || typeof hidden !== 'boolean') {
    return NextResponse.json({ error: 'Missing slug or hidden flag' }, { status: 400 });
  }

  // Read current settings to get the hidden_categories array
  const settingsRes = await fetch(`${WP_API_URL}/prag-core/v1/settings`, { cache: 'no-store' });
  const settings = settingsRes.ok ? await settingsRes.json() : {};
  const currentHidden: string[] = Array.isArray(settings.hidden_categories) ? settings.hidden_categories : [];

  let updatedHidden: string[];
  if (hidden) {
    updatedHidden = currentHidden.includes(slug) ? currentHidden : [...currentHidden, slug];
  } else {
    updatedHidden = currentHidden.filter((s) => s !== slug);
  }

  // Save back to WordPress settings
  const saveRes = await fetch(`${WP_API_URL}/prag-core/v1/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify({ hidden_categories: updatedHidden }),
    cache: 'no-store',
  });

  if (!saveRes.ok) return NextResponse.json({ error: 'Failed to update category visibility' }, { status: saveRes.status });

  await appendAuditLog({
    actorEmail: session.user?.user_email ?? 'unknown',
    action: 'category.visibility',
    target: `category:${slug}`,
    details: `${hidden ? 'Hid' : 'Showed'} category ${slug}`,
  });

  // Trigger revalidation on both frontends
  await revalidateCategories();

  return NextResponse.json({ success: true, slug, hidden, hidden_categories: updatedHidden });
}
