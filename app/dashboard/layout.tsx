import { redirect } from 'next/navigation';
import { getB2BAllowedSections, getSession, isAdmin, isSuperAdmin } from '@/lib/auth';
import { readAdminStore } from '@/lib/adminStore';
import DashboardShell from '@/components/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const admin = await isAdmin(session.token);
  if (!admin) redirect('/login?error=unauthorized');
  const superAdmin = await isSuperAdmin(session.token);

  let allowedModules: string[] | undefined;
  let allowedB2BSections: string[] | undefined;
  if (!superAdmin) {
    const store = await readAdminStore();
    const roles = Array.isArray(session.user?.roles) ? session.user.roles.map((r: string) => String(r).toLowerCase()) : [];
    const primaryRole = roles[0] ?? 'shop_manager';
    const roleVisibility = store.roleModuleVisibility[primaryRole] ?? {};
    const roleAllowedModules = Object.entries(roleVisibility)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([module]) => module);

    const userId = Number(session.user?.id);
    const userState = Number.isFinite(userId) && userId > 0 ? store.users[String(userId)] : undefined;
    if (Array.isArray(userState?.b2cModules) && userState.b2cModules.length > 0) {
      allowedModules = roleAllowedModules.filter((module) => userState.b2cModules?.includes(module as never));
    } else {
      allowedModules = roleAllowedModules;
    }

    const sections = await getB2BAllowedSections(session.token);
    if (Array.isArray(sections)) {
      allowedB2BSections = sections;
    }
  }

  return (
    <DashboardShell
      displayName={session.user?.user_display_name ?? 'Admin'}
      email={session.user?.user_email ?? ''}
      canManageAccess={superAdmin}
      allowedModules={allowedModules}
      allowedB2BSections={allowedB2BSections}
    >
      {children}
    </DashboardShell>
  );
}
