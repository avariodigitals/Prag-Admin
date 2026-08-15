'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Users, Settings, FileText, LogOut, ExternalLink, Menu, X, MapPin, BarChart3, Shield, ArrowLeftRight, ChevronDown, FolderTree, Image as ImageIcon, RefreshCw, Truck } from 'lucide-react';

interface NavChild {
  href: string;
  label: string;
  tooltip: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  moduleKey: string;
  tooltip: string;
  children?: NavChild[];
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true, moduleKey: 'dashboard', tooltip: 'View dashboard overview and stats' },
  {
    href: '/dashboard/products',
    label: 'Products',
    icon: ShoppingBag,
    moduleKey: 'products',
    tooltip: 'Manage WooCommerce products, prices and stock',
    children: [
      { href: '/dashboard/products', label: 'All Products', tooltip: 'Browse and manage all WooCommerce products' },
      { href: '/dashboard/products/categories', label: 'Category Visibility', tooltip: 'Toggle product categories on or off on the storefront' },
    ],
  },
  { href: '/dashboard/media', label: 'Media', icon: ImageIcon, moduleKey: 'media', tooltip: 'Upload and browse images in the WordPress media library' },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart, moduleKey: 'orders', tooltip: 'View and manage customer orders' },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3, moduleKey: 'reports', tooltip: 'View sales and performance reports' },
  { href: '/dashboard/customers', label: 'Customers', icon: Users, moduleKey: 'customers', tooltip: 'View and export customer list' },
  { href: '/dashboard/blog', label: 'Blog Posts', icon: FileText, moduleKey: 'blog', tooltip: 'Manage Knowledge Center blog posts' },
  { href: '/dashboard/pages', label: 'Pages', icon: FileText, moduleKey: 'pages', tooltip: 'Edit static page content (About, Contact, etc.)' },
  { href: '/dashboard/stores', label: 'Stores', icon: MapPin, moduleKey: 'stores', tooltip: 'Manage PRAG store locations' },
  { href: '/dashboard/shipping', label: 'Shipping', icon: Truck, moduleKey: 'shipping', tooltip: 'Manage shipping options, city-based delivery zones and pricing' },
  { href: '/dashboard/settings', label: 'Site Settings', icon: Settings, moduleKey: 'siteSettings', tooltip: 'Configure site-wide settings' },
];

export default function Sidebar({
  displayName,
  email,
  canManageAccess,
  allowedModules,
}: {
  displayName: string;
  email: string;
  canManageAccess: boolean;
  allowedModules?: string[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [cacheStatus, setCacheStatus] = useState<'idle' | 'clearing' | 'done' | 'error'>('idle');
  const allowed = new Set(allowedModules ?? []);
  const baseItems = NAV.filter((item) => allowed.size === 0 || allowed.has(item.moduleKey));
  const navItems: NavItem[] = canManageAccess && (allowed.size === 0 || allowed.has('adminSettings'))
    ? [...baseItems, { href: '/dashboard/admin-settings', label: 'Admin Settings', icon: Shield, moduleKey: 'adminSettings', exact: false, tooltip: 'Manage admin users and role permissions' }]
    : baseItems;

  // Auto-expand Products sub-menu when on a products sub-page
  useEffect(() => {
    if (pathname.startsWith('/dashboard/products')) {
      setExpandedMenus((prev) => new Set(prev).add('/dashboard/products'));
    }
  }, [pathname]);

  function toggleMenu(href: string) {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  async function clearCache() {
    setCacheStatus('clearing');
    try {
      const res = await fetch('/api/admin/clear-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'all' }),
      });
      if (!res.ok) throw new Error('Failed');
      setCacheStatus('done');
      setTimeout(() => setCacheStatus('idle'), 3000);
    } catch {
      setCacheStatus('error');
      setTimeout(() => setCacheStatus('idle'), 3000);
    }
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4">
        <div className="relative w-28 h-8">
          <Image src="https://central.prag.global/wp-content/uploads/2026/04/Prag-Logo.png" alt="PRAG" fill className="object-contain" priority />
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col h-screen transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shrink-0`}>
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="relative w-32 h-10 mb-1">
              <Image src="https://central.prag.global/wp-content/uploads/2026/04/Prag-Logo.png" alt="PRAG" fill className="object-contain" priority />
            </div>
            <p className="text-xs text-gray-500/50">Developed by Avario Digitals</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, exact, tooltip, children }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            const hasChildren = children && children.length > 0;
            const expanded = expandedMenus.has(href);
            return (
              <div key={href}>
                {hasChildren ? (
                  <button
                    onClick={() => toggleMenu(href)}
                    title={tooltip ?? label}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active ? 'bg-sky-700 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={17} />
                    <span className="flex-1 text-left">{label}</span>
                    <ChevronDown size={15} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link href={href} onClick={() => setIsOpen(false)} title={tooltip ?? label}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active ? 'bg-sky-700 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}>
                    <Icon size={17} />
                    {label}
                  </Link>
                )}
                {hasChildren && expanded && (
                  <div className="mt-0.5 space-y-0.5">
                    {children!.map((child) => {
                      const childActive = pathname === child.href || (child.href !== href && pathname.startsWith(child.href));
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setIsOpen(false)}
                          title={child.tooltip ?? child.label}
                          className={`flex items-center gap-2 pl-10 pr-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            childActive ? 'text-sky-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <FolderTree size={14} />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-0.5">
          <div className="mx-0 mb-1 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 flex items-center gap-3">
            <ArrowLeftRight size={16} className="text-amber-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">Portal</p>
              <Link href="/dashboard/b2b" onClick={() => setIsOpen(false)} title="Switch to the B2B admin portal" className="text-xs text-amber-700 hover:underline font-medium">Switch to B2B →</Link>
            </div>
          </div>
          <button
            onClick={clearCache}
            disabled={cacheStatus === 'clearing'}
            title="Clear the Next.js data cache on both shop.prag.global and www.prag.global"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${
              cacheStatus === 'done'
                ? 'text-green-600 bg-green-50'
                : cacheStatus === 'error'
                ? 'text-red-500 bg-red-50'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <RefreshCw size={16} className={cacheStatus === 'clearing' ? 'animate-spin' : ''} />
            {cacheStatus === 'clearing' ? 'Clearing cache…' : cacheStatus === 'done' ? 'Cache cleared!' : cacheStatus === 'error' ? 'Failed — try again' : 'Clear Site Cache'}
          </button>
          <a href="https://shop.prag.global" target="_blank" rel="noopener noreferrer" title="Open the PRAG storefront in a new tab"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
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
          <button onClick={logout} title="Sign out of your admin session"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors font-medium">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
