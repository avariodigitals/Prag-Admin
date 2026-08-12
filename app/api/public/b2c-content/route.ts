import { NextResponse } from 'next/server';
import { readB2CPages } from '@/lib/adminStore';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    const pages = await readB2CPages();
    return NextResponse.json(
      { pages, updatedAt: new Date().toISOString() },
      {
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
          'X-B2C-Content-Source': 'wordpress',
        },
      },
    );
  } catch (error) {
    console.error('Failed to read B2C content:', error);
    return NextResponse.json(
      { pages: [], error: 'Unable to fetch B2C content.' },
      { status: 500 },
    );
  }
}
