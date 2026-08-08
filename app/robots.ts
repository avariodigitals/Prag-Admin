import type { MetadataRoute } from 'next';

// portal.prag.global is an admin app with zero SEO purpose.
// Disallow all crawling. This is defense-in-depth; the primary
// exclusion is the noindex/nofollow metadata in app/layout.tsx.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
  };
}
