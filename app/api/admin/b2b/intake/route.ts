import { NextResponse } from 'next/server';
import { appendB2BAuditLog, updateB2BAdminStore, type B2BSubmissionKind, type B2BSubmissionRecord } from '@/lib/b2bAdminStore';

function randomId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const kind: B2BSubmissionKind = body?.kind === 'distributor' ? 'distributor' : 'contact';
  const record: B2BSubmissionRecord = {
    id: randomId(),
    kind,
    status: 'new' as const,
    name: String(body?.name ?? ''),
    email: String(body?.email ?? ''),
    phone: body?.phone ? String(body.phone) : undefined,
    company: body?.company ? String(body.company) : undefined,
    subject: body?.subject ? String(body.subject) : undefined,
    message: String(body?.message ?? ''),
    source: body?.source === 'admin' ? 'admin' as const : 'public-form' as const,
    route: String(body?.route ?? '/contact'),
    createdAt: new Date().toISOString(),
  };

  const store = await updateB2BAdminStore((current) => {
    if (kind === 'distributor') {
      return {
        ...current,
        distributorApplications: [record, ...current.distributorApplications].slice(0, 500),
      };
    }

    return {
      ...current,
      enquiries: [record, ...current.enquiries].slice(0, 500),
    };
  });

  await appendB2BAuditLog({
    actor: record.email || 'public-form',
    action: 'create',
    target: kind === 'distributor' ? 'distributor application' : 'contact enquiry',
    details: `Received via ${record.route}`,
  });

  return NextResponse.json({ success: true, record, store });
}
