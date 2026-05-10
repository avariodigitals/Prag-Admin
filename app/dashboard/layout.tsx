import { redirect } from 'next/navigation';
import { getSession, isAdmin, isSuperAdmin } from '@/lib/auth';
import { readAdminStore } from '@/lib/adminStore';
import DashboardShell from '@/components/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const admin = await isAdmin(session.token);
  if (!admin) redirect('/login?error=unauthorized');
  const superAdmin = await isSuperAdmin(session.token);

  let allowedModules: string[] | undefined;
  if (!superAdmin) {
    const store = await readAdminStore();
    const roles = Array.isArray(session.user?.roles) ? session.user.roles.map((r: string) => String(r).toLowerCase()) : [];
    const primaryRole = roles[0] ?? 'shop_manager';
    const roleVisibility = store.roleModuleVisibility[primaryRole] ?? {};
    allowedModules = Object.entries(roleVisibility)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([module]) => module);
  }

  return (
    <DashboardShell
      displayName={session.user?.user_display_name ?? 'Admin'}
      email={session.user?.user_email ?? ''}
      canManageAccess={superAdmin}
      allowedModules={allowedModules}
    >
      {children}
    </DashboardShell>
  );
}
