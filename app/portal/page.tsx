import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import PortalClient from './portal-client';

export default async function PortalPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return <PortalClient canAccessB2B={Array.isArray(session.user?.portals) ? session.user.portals.includes('b2b') : false} />;
}
