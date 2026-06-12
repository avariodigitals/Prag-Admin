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
  let kind: B2BSubmissionKind;
  if (body?.kind === 'distributor') {
    kind = 'distributor';
  } else if (body?.kind === 'careers') {
    kind = 'careers';
  } else {
    kind = 'contact';
  }
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
    location: body?.location ? String(body.location) : undefined,
    position: body?.position ? String(body.position) : undefined,
    experience: body?.experience ? String(body.experience) : undefined,
    education: body?.education ? String(body.education) : undefined,
    cvLink: body?.cvLink ? String(body.cvLink) : undefined,
  };

  const store = await updateB2BAdminStore((current) => {
    if (kind === 'distributor') {
      return {
        ...current,
        distributorApplications: [record, ...current.distributorApplications].slice(0, 500),
      };
    }
    if (kind === 'careers') {
      return {
        ...current,
        careerApplications: [record, ...current.careerApplications].slice(0, 500),
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
    target: kind === 'distributor' ? 'distributor application' : kind === 'careers' ? 'careers application' : 'contact enquiry',
    details: `Received via ${record.route}`,
  });

  // Honor form routing rules saved in Site Settings -> Forms.
  try {
    const normalizedRoute = String(record.route || '').trim().toLowerCase();
    let formKey: string;
    if (kind === 'distributor') {
      formKey = 'distributor';
    } else if (kind === 'careers' || normalizedRoute === '/careers') {
      formKey = 'careers';
    } else if (normalizedRoute === '/free-power-assessment') {
      formKey = 'free-power-assessment';
    } else {
      formKey = 'contact';
    }
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
        const subjectPrefix = rule?.formName?.trim() || (kind === 'distributor' ? 'Distributor Application' : kind === 'careers' ? 'Careers Application' : 'Contact Form');
        const subject = `${subjectPrefix}: ${record.name || 'New submission'}`;

        const messageLines = [
          `Form: ${subjectPrefix}`,
          `Name: ${record.name || '-'}`,
          `Email: ${record.email || '-'}`,
          `Phone: ${record.phone || '-'}`,
          `Position: ${record.position || record.company || '-'}`,
          `Location: ${record.location || '-'}`,
          `Experience: ${record.experience || '-'}`,
          `Education: ${record.education || '-'}`,
          `CV/Resume: ${record.cvLink || '-'}`,
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
      target: kind === 'distributor' ? 'distributor routing' : kind === 'careers' ? 'careers routing' : 'contact routing',
      details: error instanceof Error ? error.message : 'Unknown notification error',
    });
  }

  return NextResponse.json({ success: true, record, store });
}
