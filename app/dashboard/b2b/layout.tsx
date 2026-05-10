import { redirect } from 'next/navigation';
import { getSession, isAdmin, hasPortalAccess } from '@/lib/auth';

export default async function B2BLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const admin = await isAdmin(session.token);
  if (!admin) redirect('/login?error=unauthorized');

  const allowed = await hasPortalAccess(session.token, 'b2b');
  if (!allowed) {
    redirect('/portal');
  }

  return <>{children}</>;
}