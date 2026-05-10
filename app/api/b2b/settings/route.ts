import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://central.prag.global/wp-json';

type B2BSocialLinks = {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  whatsapp: string;
};

type B2BSettingsPayload = {
  contact_phone: string;
  contact_email: string;
  address: string;
  business_hours_weekday: string;
  business_hours_saturday: string;
  announcement_bar: string;
  socials: B2BSocialLinks;
};

const EMPTY_SOCIALS: B2BSocialLinks = {
  facebook: '',
  instagram: '',
  linkedin: '',
  twitter: '',
  whatsapp: '',
};

const EMPTY_SETTINGS: B2BSettingsPayload = {
  contact_phone: '',
  contact_email: '',
  address: '',
  business_hours_weekday: '',
  business_hours_saturday: '',
  announcement_bar: '',
  socials: EMPTY_SOCIALS,
};

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeSettings(value: unknown): B2BSettingsPayload {
  if (!value || typeof value !== 'object') return EMPTY_SETTINGS;

  const source = value as Record<string, unknown>;
  const socialsSource = source.socials && typeof source.socials === 'object'
    ? source.socials as Record<string, unknown>
    : {};

  return {
    contact_phone: cleanString(source.contact_phone),
    contact_email: cleanString(source.contact_email),
    address: cleanString(source.address),
    business_hours_weekday: cleanString(source.business_hours_weekday),
    business_hours_saturday: cleanString(source.business_hours_saturday),
    announcement_bar: cleanString(source.announcement_bar),
    socials: {
      facebook: cleanString(socialsSource.facebook),
      instagram: cleanString(socialsSource.instagram),
      linkedin: cleanString(socialsSource.linkedin),
      twitter: cleanString(socialsSource.twitter),
      whatsapp: cleanString(socialsSource.whatsapp),
    },
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const res = await fetch(`${WP_API_URL}/prag-core/v1/settings`, {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch settings from backend' },
        { status: res.status || 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(normalizeSettings(data));
  } catch (error) {
    console.error('B2B settings GET failed:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const payload = normalizeSettings(body);

    const res = await fetch(`${WP_API_URL}/prag-core/v1/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const details = await res.text();
      return NextResponse.json(
        { ok: false, error: details || 'Failed to save settings' },
        { status: res.status || 502 },
      );
    }

    return NextResponse.json({ ok: true, data: payload });
  } catch (error) {
    console.error('B2B settings POST failed:', error);
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}
