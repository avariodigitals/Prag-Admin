const PRAG_URL = 'https://shop.prag.global';
const B2B_URL = 'https://prag.global';

type RevalidateOptions = {
  paths?: string[];
  tags?: string[];
  b2bOnly?: boolean;
  b2cOnly?: boolean;
};

const B2C_TAGS = [
  'product-categories',
  'products-list',
  'featured-products',
  'flash-sale-products',
  'product-by-slug',
  'product-reviews',
  'tech-documents',
  'product-custom-tabs',
  'all-product-slugs',
  'site-settings',
  'wordpress-content',
  'wc-products',
  'wc-settings',
  'wc-stores',
];

const B2B_TAGS = [
  'b2b-categories',
  'b2b-products-list',
  'b2b-product-by-slug',
  'b2b-product-reviews',
  'b2b-tech-documents',
  'b2b-site-settings',
  'b2b-stores',
  'b2b-product-custom-tabs',
  'b2b-all-product-slugs',
];

export async function revalidateFrontend(options: RevalidateOptions = {}) {
  const secret = process.env.NEXT_PUBLIC_REVALIDATE_SECRET || 'dev-secret';
  const { paths, tags, b2bOnly, b2cOnly } = options;

  const body = JSON.stringify({
    paths: paths ?? ['/', '/products'],
    tags: tags ?? [],
  });

  const fetchOpts = {
    method: 'POST' as const,
    headers: { 'Content-Type': 'application/json' },
    body,
  };

  const targets: string[] = [];
  if (!b2bOnly) targets.push(PRAG_URL);
  if (!b2cOnly) targets.push(B2B_URL);

  await Promise.allSettled(
    targets.map((base) =>
      fetch(`${base}/api/revalidate?secret=${secret}`, {
        ...fetchOpts,
        signal: AbortSignal.timeout(10_000),
      }).catch(() => {})
    )
  );
}

export async function revalidateProducts() {
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

export async function revalidateBlog() {
  await revalidateFrontend({
    paths: ['/blog', '/sitemap.xml'],
    tags: ['wordpress-content'],
    b2cOnly: true,
  });
}

export async function revalidateStores() {
  await revalidateFrontend({
    paths: ['/stores', '/sitemap.xml'],
    tags: ['wc-stores', 'b2b-stores'],
  });
}

export async function revalidateSettings() {
  await revalidateFrontend({
    paths: ['/', '/products', '/sitemap.xml', '/robots.txt'],
    tags: ['site-settings', 'b2b-site-settings', 'wordpress-content', 'wc-settings'],
  });
}

export async function revalidateB2BContent() {
  await revalidateFrontend({
    paths: ['/', '/sitemap.xml', '/robots.txt'],
    tags: ['b2b-site-settings', 'b2b-categories', 'b2b-products-list', 'b2b-public-content', 'b2b-sitemap'],
    b2bOnly: true,
  });
}
