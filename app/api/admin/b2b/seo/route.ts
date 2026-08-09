import { NextRequest, NextResponse } from 'next/server';
import { readB2BAdminStore, writeB2BAdminStore, type B2BSeoOverride, type B2BSeoOverrideMap } from '@/lib/b2bAdminStore';
import { appendAuditLog } from '@/lib/adminStore';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const store = await readB2BAdminStore();
    return NextResponse.json({ success: true, seoOverrides: store.seoOverrides || {} });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch SEO overrides' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { route, override } = body as { route: string; override: B2BSeoOverride };

    if (!route || typeof route !== 'string') {
      return NextResponse.json({ success: false, error: 'Route is required' }, { status: 400 });
    }

    if (!override || typeof override !== 'object') {
      return NextResponse.json({ success: false, error: 'Override object is required' }, { status: 400 });
    }

    const normalizedRoute = route.startsWith('/') ? route : `/${route}`;

    const store = await readB2BAdminStore();
    const seoOverrides: B2BSeoOverrideMap = { ...(store.seoOverrides || {}) };

    // If all override fields are empty, remove the entry entirely
    const hasContent = Object.values(override).some((v) => {
      if (Array.isArray(v)) return v.length > 0;
      return typeof v === 'string' && v.trim().length > 0;
    });

    if (hasContent) {
      seoOverrides[normalizedRoute] = override;
    } else {
      delete seoOverrides[normalizedRoute];
    }

    await writeB2BAdminStore({ ...store, seoOverrides });
    await appendAuditLog({
      actorEmail: session.user?.user_email ?? 'unknown',
      action: 'seo.override.updated',
      target: `route:${normalizedRoute}`,
      details: hasContent ? 'Updated SEO override' : 'Removed SEO override',
    });

    return NextResponse.json({ success: true, seoOverrides });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update SEO override' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const route = searchParams.get('route');

    if (!route) {
      return NextResponse.json({ success: false, error: 'Route is required' }, { status: 400 });
    }

    const normalizedRoute = route.startsWith('/') ? route : `/${route}`;

    const store = await readB2BAdminStore();
    const seoOverrides: B2BSeoOverrideMap = { ...(store.seoOverrides || {}) };
    delete seoOverrides[normalizedRoute];

    await writeB2BAdminStore({ ...store, seoOverrides });
    await appendAuditLog({
      actorEmail: session.user?.user_email ?? 'unknown',
      action: 'seo.override.deleted',
      target: `route:${normalizedRoute}`,
      details: 'Deleted SEO override',
    });

    return NextResponse.json({ success: true, seoOverrides });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete SEO override' }, { status: 500 });
  }
}
