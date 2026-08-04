import { NextRequest, NextResponse } from 'next/server';
import { readB2BAdminStore, writeB2BAdminStore } from '@/lib/b2bAdminStore';

export async function GET() {
  try {
    const store = await readB2BAdminStore();
    return NextResponse.json({ success: true, redirects: store.settings.redirects || [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch redirects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source, destination, permanent = true } = body;

    if (!source || !destination) {
      return NextResponse.json({ success: false, error: 'Source and destination are required' }, { status: 400 });
    }

    const store = await readB2BAdminStore();
    const newRedirect = {
      id: `redirect-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      source: source.startsWith('/') ? source : `/${source}`,
      destination: destination.startsWith('/') ? destination : `/${destination}`,
      permanent: Boolean(permanent),
      active: true,
      createdAt: new Date().toISOString(),
      hits: 0,
    };

    const updatedRedirects = [...(store.settings.redirects || []), newRedirect];
    const updatedStore = {
      ...store,
      settings: {
        ...store.settings,
        redirects: updatedRedirects,
      },
    };

    await writeB2BAdminStore(updatedStore);

    return NextResponse.json({ success: true, redirect: newRedirect });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create redirect' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Redirect ID is required' }, { status: 400 });
    }

    const store = await readB2BAdminStore();
    const updatedRedirects = (store.settings.redirects || []).filter((r) => r.id !== id);

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
    return NextResponse.json({ success: false, error: 'Failed to delete redirect' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, active, permanent, destination } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Redirect ID is required' }, { status: 400 });
    }

    const store = await readB2BAdminStore();
    const updatedRedirects = (store.settings.redirects || []).map((r) => {
      if (r.id === id) {
        return {
          ...r,
          ...(active !== undefined && { active: Boolean(active) }),
          ...(permanent !== undefined && { permanent: Boolean(permanent) }),
          ...(destination && { destination: destination.startsWith('/') ? destination : `/${destination}` }),
        };
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
    return NextResponse.json({ success: false, error: 'Failed to update redirect' }, { status: 500 });
  }
}