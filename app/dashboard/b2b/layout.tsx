import { redirect } from 'next/navigation';
import { getSession, isAdmin } from '@/lib/auth';
import B2BSidebar from '@/components/B2BSidebar';

export default async function B2BLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const admin = await isAdmin(session.token);
  if (!admin) redirect('/login?error=unauthorized');

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50">
      <B2BSidebar
        displayName={session.user?.user_display_name ?? 'Admin'}
        email={session.user?.user_email ?? ''}
      />
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
