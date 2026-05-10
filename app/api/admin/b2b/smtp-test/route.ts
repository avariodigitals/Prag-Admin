import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSession, isAdmin } from '@/lib/auth';
import { appendB2BAuditLog, readB2BAdminStore } from '@/lib/b2bAdminStore';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isAdmin(session.token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await req.json()) as { to?: string };
  const to = String(body.to ?? '').trim();
  if (!to) return NextResponse.json({ error: 'Recipient email is required.' }, { status: 400 });

  const store = await readB2BAdminStore();
  const smtp = store.settings.smtp;

  if (smtp.useWordPressMailer) {
    await appendB2BAuditLog({
      actor: session.user?.user_email ?? 'admin',
      action: 'smtp.test.skipped-wordpress-mailer',
      target: to,
      details: 'SMTP test skipped because WordPress mailer is enabled.',
    });

    return NextResponse.json({
      success: true,
      message: 'WordPress mailer is enabled. Disable it to test direct SMTP transport.',
    });
  }

  if (!smtp.host || !smtp.port || !smtp.username || !smtp.password || !smtp.fromEmail) {
    return NextResponse.json({ error: 'SMTP settings are incomplete. Save host, port, username, password, and from email first.' }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.username,
        pass: smtp.password,
      },
    });

    await transporter.verify();
    await transporter.sendMail({
      from: smtp.fromName ? `${smtp.fromName} <${smtp.fromEmail}>` : smtp.fromEmail,
      to,
      subject: 'PRAG B2B SMTP test email',
      text: `This is a test email from PRAG B2B SMTP settings.\n\nSent at: ${new Date().toISOString()}`,
      html: `<p>This is a test email from PRAG B2B SMTP settings.</p><p>Sent at: ${new Date().toISOString()}</p>`,
    });

    await appendB2BAuditLog({
      actor: session.user?.user_email ?? 'admin',
      action: 'smtp.test.sent',
      target: to,
      details: 'B2B SMTP test email sent successfully.',
    });

    return NextResponse.json({ success: true, message: `Test email sent to ${to}.` });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'SMTP test failed.';
    await appendB2BAuditLog({
      actor: session.user?.user_email ?? 'admin',
      action: 'smtp.test.failed',
      target: to,
      details: detail,
    });
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
