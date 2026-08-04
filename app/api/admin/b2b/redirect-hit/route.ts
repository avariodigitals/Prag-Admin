import { NextRequest, NextResponse } from 'next/server';
import { readB2BAdminStore, writeB2BAdminStore } from '@/lib/b2bAdminStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source } = body;

    if (!source) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const store = await readB2BAdminStore();
    const updatedRedirects = (store.settings.redirects || []).map((r) => {
      if (r.source === source) {
        return { ...r, hits: (r.hits || 0) + 1 };
      }
      return r;
    });

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