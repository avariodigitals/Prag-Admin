import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/auth';

const WC = `${process.env.NEXT_PUBLIC_WP_API_URL?.replace('/wp-json', '/wp-json/wc/v3') ?? 'https://central.prag.global/wp-json/wc/v3'}`;
const AUTH = `consumer_key=${process.env.WC_CONSUMER_KEY}&consumer_secret=${process.env.WC_CONSUMER_SECRET}`;

interface WCCategory {
  id: number;
  name: string;
  slug: string;
}

interface WCProduct {
  id: number;
  name: string;
  slug: string;
  status?: string;
  categories?: WCCategory[];
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [productsRes, categoriesRes] = await Promise.all([
    fetch(`${WC}/products?per_page=100&status=publish&${AUTH}`, { cache: 'no-store' }),
    fetch(`${WC}/products/categories?per_page=100&${AUTH}`, { cache: 'no-store' }),
  ]);

  if (!productsRes.ok || !categoriesRes.ok) {
    return NextResponse.json({ error: 'Failed to load product catalog' }, { status: 502 });
  }

  const productsRaw = (await productsRes.json()) as WCProduct[];
  const categoriesRaw = (await categoriesRes.json()) as WCCategory[];

  const products = productsRaw
    .filter((product) => product?.id && product?.name)
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      categories: Array.isArray(product.categories)
        ? product.categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
        }))
        : [],
    }));

  const categories = categoriesRaw
    .filter((category) => category?.slug)
    .map((category) => ({ id: category.id, name: category.name, slug: category.slug }));

  return NextResponse.json({ products, categories });
}
