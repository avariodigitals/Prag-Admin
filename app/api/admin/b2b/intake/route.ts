import { NextResponse } from 'next/server';
import { appendB2BAuditLog, updateB2BAdminStore, type B2BSubmissionKind, type B2BSubmissionRecord } from '@/lib/b2bAdminStore';
import nodemailer from 'nodemailer';

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

  // Honor form routing rules saved in Site Settings -> Forms.
  try {
    const normalizedRoute = String(record.route || '').trim().toLowerCase();
    const formKey = kind === 'distributor'
      ? 'distributor'
      : (normalizedRoute === '/free-power-assessment' ? 'free-power-assessment' : 'contact');
    const rule = store.settings.forms.find((item) => item.formKey === formKey);
    const recipients = Array.isArray(rule?.recipients) ? rule.recipients.filter(Boolean) : [];
    const smtp = store.settings.smtp;

    if (!smtp.useWordPressMailer && recipients.length > 0) {
      const canSend = Boolean(smtp.host && smtp.port && smtp.username && smtp.password && (rule?.fromEmail || smtp.fromEmail));
      if (canSend) {
        const transporter = nodemailer.createTransport({
          host: smtp.host,
          port: smtp.port,
          secure: smtp.secure,
          auth: {
            user: smtp.username,
            pass: smtp.password,
          },
        });

        const senderEmail = (rule?.fromEmail || smtp.fromEmail || '').trim();
        const senderName = (rule?.senderName || smtp.fromName || 'PRAG B2B').trim();
        const subjectPrefix = rule?.formName?.trim() || (kind === 'distributor' ? 'Distributor Application' : 'Contact Form');
        const subject = `${subjectPrefix}: ${record.name || 'New submission'}`;

        const messageLines = [
          `Form: ${subjectPrefix}`,
          `Name: ${record.name || '-'}`,
          `Email: ${record.email || '-'}`,
          `Phone: ${record.phone || '-'}`,
          `Company: ${record.company || '-'}`,
          `Route: ${record.route || '-'}`,
          `Submitted At: ${record.createdAt}`,
          '',
          'Message:',
          record.message || '-',
        ];

        await transporter.sendMail({
          from: senderName ? `${senderName} <${senderEmail}>` : senderEmail,
          to: recipients.join(', '),
          subject,
          text: messageLines.join('\n'),
        });

        await appendB2BAuditLog({
          actor: record.email || 'public-form',
          action: 'notify',
          target: `${formKey} routing`,
          details: `Notification sent to ${recipients.join(', ')}`,
        });
      } else {
        await appendB2BAuditLog({
          actor: record.email || 'public-form',
          action: 'notify.skipped',
          target: `${formKey} routing`,
          details: 'SMTP settings incomplete for routed notification.',
        });
      }
    }
  } catch (error) {
    await appendB2BAuditLog({
      actor: record.email || 'public-form',
      action: 'notify.failed',
      target: kind === 'distributor' ? 'distributor routing' : 'contact routing',
      details: error instanceof Error ? error.message : 'Unknown notification error',
    });
  }

  return NextResponse.json({ success: true, record, store });
}
