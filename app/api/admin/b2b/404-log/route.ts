import { NextRequest, NextResponse } from 'next/server';
import { appendB2BAuditLog } from '@/lib/b2bAdminStore';

function isAllowedB2BHost(host: string) {
  const normalized = host.toLowerCase();
  const allowed = (process.env.B2B_404_ALLOWED_HOSTS ?? 'localhost,127.0.0.1,prag.global').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  return allowed.some((item) => normalized === item || normalized.endsWith(`.${item}`));
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { path?: string; host?: string; referrer?: string; userAgent?: string };
    const loggedPath = String(body.path ?? '').trim();
    const loggedHost = String(body.host ?? '').trim();

    if (!loggedPath.startsWith('/') || !loggedHost || !isAllowedB2BHost(loggedHost)) {
      return NextResponse.json({ success: false, ignored: true });
    }

    const details = [`host=${loggedHost}`, `path=${loggedPath}`]
      .concat(body.referrer ? [`referrer=${String(body.referrer)}`] : [])
      .concat(body.userAgent ? [`ua=${String(body.userAgent)}`] : [])
      .join(' | ');

    await appendB2BAuditLog({
      actor: 'prag-b2b',
      action: '404.not-found',
      target: loggedPath,
      details,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
