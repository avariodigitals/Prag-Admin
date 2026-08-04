import { NextRequest, NextResponse } from 'next/server';
import { readB2BAdminStore, writeB2BAdminStore } from '@/lib/b2bAdminStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source, host } = body;

    if (!source) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const store = await readB2BAdminStore();
    const existingRedirects = store.settings.redirects || [];
    
    // Try to find a matching redirect (exact source match or pattern match)
    let matched = false;
    const updatedRedirects = existingRedirects.map((r) => {
      // Exact match
      if (r.source === source) {
        matched = true;
        return { ...r, hits: (r.hits || 0) + 1 };
      }
      // Pattern match (source might be a pattern like /shop/:product)
      const sourcePattern = r.source.replace(/:([^/]+)/g, '([^/]+)');
      if (sourcePattern !== r.source) {
        const regex = new RegExp(`^${sourcePattern}$`);
        if (regex.test(source)) {
          matched = true;
          return { ...r, hits: (r.hits || 0) + 1 };
        }
      }
      return r;
    });

    // If no matching redirect found, auto-create a tracked entry
    // so hits are still counted even for legacy/pattern redirects
    if (!matched) {
      updatedRedirects.push({
        id: `redirect-auto-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        source,
        destination: '',
        permanent: true,
        active: false,
        createdAt: new Date().toISOString(),
        hits: 1,
      });
    }

    const updatedStore = {
      ...store,
      settings: {
        ...store.settings,
        redirects: updatedRedirects,
      },
    };

    await writeB2BAdminStore(updatedStore);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}