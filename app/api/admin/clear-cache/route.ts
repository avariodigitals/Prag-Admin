import { NextResponse } from 'next/server';
import { revalidateFrontend } from '@/lib/revalidateFrontend';

export const dynamic = 'force-dynamic';

/**
 * Clear the Next.js data cache (unstable_cache / revalidateTag) on both
 * shop.prag.global and www.prag.global.
 *
 * POST /api/admin/clear-cache
 * Body (optional): { "scope": "products" | "all" }
 *   - "products" (default): busts product-related cache tags
 *   - "all": busts every known cache tag on both frontends
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const scope: 'products' | 'all' = body?.scope === 'all' ? 'all' : 'products';

    if (scope === 'all') {
      await revalidateFrontend({
        paths: ['/', '/products', '/sitemap.xml', '/robots.txt'],
        tags: [
          // B2C (shop)
          'product-categories', 'products-list', 'featured-products', 'flash-sale-products',
          'product-by-slug', 'product-reviews', 'tech-documents', 'product-custom-tabs',
          'all-product-slugs', 'site-settings', 'wordpress-content', 'wc-products',
          'wc-settings', 'wc-stores',
          // B2B (www)
          'b2b-public-content', 'b2b-site-settings', 'b2b-categories', 'b2b-hidden-categories',
          'b2b-products-list', 'b2b-product-by-slug', 'b2b-product-reviews', 'b2b-tech-documents',
          'b2b-stores', 'b2b-product-custom-tabs', 'b2b-all-product-slugs', 'b2b-sitemap',
        ],
      });
    } else {
      await revalidateFrontend({
        paths: ['/', '/products', '/sitemap.xml'],
        tags: [
          'products-list', 'product-by-slug', 'featured-products', 'flash-sale-products',
          'product-categories', 'all-product-slugs', 'product-custom-tabs', 'tech-documents',
          'b2b-products-list', 'b2b-product-by-slug', 'b2b-categories', 'b2b-all-product-slugs',
          'b2b-product-custom-tabs', 'b2b-tech-documents',
        ],
      });
    }

    return NextResponse.json({ ok: true, scope, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
