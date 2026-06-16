'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Mail, Building2, House, FileText, Settings, Menu, X, ExternalLink, LogOut, BookOpenCheck, Lightbulb, ArrowLeftRight, Users, Wrench } from 'lucide-react';

const MAIN_NAV = [
  { href: '/dashboard/b2b', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/b2b/enquiries', label: 'Enquiries', icon: Mail },
  { href: '/dashboard/b2b/support', label: 'Technical Support', icon: Wrench },
  { href: '/dashboard/b2b/distributors', label: 'Distributor Apps', icon: Building2 },
  { href: '/dashboard/b2b/careers', label: 'Careers', icon: Users },
  { href: '/dashboard/b2b/installations', label: 'Installations', icon: House },
  { href: '/dashboard/b2b/case-studies', label: 'Case Studies', icon: BookOpenCheck },
  { href: '/dashboard/b2b/solutions', label: 'Solutions', icon: Lightbulb },
  { href: '/dashboard/b2b/pages', label: 'Pages', icon: FileText },
  { href: '/dashboard/b2b/site-settings', label: 'Site Settings', icon: Settings },
  { href: '/dashboard/b2b/super-settings', label: 'Super Settings', icon: Settings },
];

function routeToSection(href: string) {
  const path = href.replace('/dashboard/b2b', '').replace(/^\//, '');
  return path || 'overview';
}

export default function B2BSidebar({ displayName, email, allowedSections }: { displayName: string; email: string; allowedSections?: string[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const hasRestrictions = Array.isArray(allowedSections) && allowedSections.length > 0;

  const superSettingsChildKeys = ['scripts', 'smtp', 'forms', 'access', 'launch', 'audit'];

  const mainNavItems = MAIN_NAV.filter((item) => {
    const section = routeToSection(item.href);
    if (!hasRestrictions) return true;
    if (section === 'super-settings') {
      return allowedSections.includes('super-settings') || allowedSections.some((key) => superSettingsChildKeys.includes(key));
    }
    return allowedSections.includes(section);
  });

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4">
        <div className="relative w-28 h-8">
          <Image src="https://central.prag.global/wp-content/uploads/2026/04/Prag-Logo.png" alt="PRAG" fill className="object-contain" priority />
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col h-screen transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shrink-0`}>
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="relative w-32 h-10 mb-1">
              <Image src="https://central.prag.global/wp-content/uploads/2026/04/Prag-Logo.png" alt="PRAG" fill className="object-contain" priority />
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-600">PRAG B2B</p>
          <p className="text-sm text-gray-600 mt-1">Manage enquiries, page content, site settings and routing.</p>
        </div>

        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          <div className="space-y-0.5">
            {mainNavItems.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-sky-700 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-0.5">
        <div className="mx-3 mb-1 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5 flex items-center gap-3">
            <ArrowLeftRight size={16} className="text-sky-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">Portal</p>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-xs text-sky-700 hover:underline font-medium">Switch to B2C →</Link>
            </div>
          </div>
          <a
            href="https://shop.prag.global"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <ExternalLink size={16} />
            View Store
          </a>
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold shrink-0">
              {displayName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
