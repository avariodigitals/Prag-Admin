'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import B2BSidebar from '@/components/B2BSidebar';

export default function DashboardShell({
  displayName,
  email,
  canManageAccess,
  allowedModules,
  children,
}: {
  displayName: string;
  email: string;
  canManageAccess: boolean;
  allowedModules?: string[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isB2B = pathname.startsWith('/dashboard/b2b');

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50">
      {isB2B ? (
        <B2BSidebar displayName={displayName} email={email} />
      ) : (
        <Sidebar
          displayName={displayName}
          email={email}
          canManageAccess={canManageAccess}
          allowedModules={allowedModules}
        />
      )}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}