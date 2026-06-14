'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminLogoutButton } from '@/components/AdminLogoutButton';

type NavItem = {
  name: string;
  href: string;
  icon: IconName;
};

type IconName = 'dashboard' | 'ticket' | 'orders' | 'receipt' | 'users' | 'user' | 'settings' | 'logs';

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { name: 'Rifas', href: '/admin/rifas', icon: 'ticket' },
  { name: 'Órdenes', href: '/admin/ordenes', icon: 'orders' },
  { name: 'Comprobantes', href: '/admin/comprobantes', icon: 'receipt' },
  { name: 'Clientes', href: '/admin/clientes', icon: 'users' },
  { name: 'Usuarios', href: '/admin/usuarios', icon: 'user' },
  { name: 'Configuración', href: '/admin/configuracion', icon: 'settings' },
  { name: 'Logs', href: '/admin/logs', icon: 'logs' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const currentTitle = navItems.find((item) => item.href === pathname)?.name || 'Panel';

  const linkClass = (href: string) => {
    const isActive = pathname === href;

    return `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
      isActive
        ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/15 ring-1 ring-gold-300/25'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
    }`;
  };

  return (
    <div className="isolate flex min-h-screen overflow-x-hidden bg-[#eef3ef] text-slate-950 dark:bg-[#0a1117] dark:text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(18,155,98,0.14),transparent_32%),linear-gradient(180deg,#f6f8f5,#e7eee9)] dark:bg-[radial-gradient(circle_at_top_left,rgba(18,155,98,0.16),transparent_30%),linear-gradient(180deg,#101923,#081015)]" />

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 dark:border-slate-800 dark:bg-[#0f1720] lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-300 text-brand-900 shadow-lg shadow-gold-900/10">
                  <NavIcon name="ticket" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">interRIFAS</h2>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Administración
                  </p>
                </div>
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 lg:hidden"
                aria-label="Cerrar menú"
                title="Cerrar menú"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkClass(item.href)}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isActive ? 'bg-white/15 text-gold-100' : 'bg-slate-100 text-slate-500 group-hover:text-brand-600 dark:bg-white/5 dark:text-slate-300'}`}>
                    <NavIcon name={item.icon} />
                  </span>
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <AdminLogoutButton />
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col transition-all duration-300 lg:ml-72">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-[#111b24]/92 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition-transform active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:hidden"
              aria-label="Abrir menú"
              title="Abrir menú"
            >
              <MenuIcon />
            </button>
            <h1 className="truncate text-base font-extrabold text-slate-900 dark:text-white lg:text-xl">{currentTitle}</h1>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-3 pr-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <span className="hidden text-xs font-bold uppercase tracking-wider text-slate-500 sm:inline">Admin</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-extrabold text-white shadow-sm shadow-brand-900/20">
              A
            </div>
          </div>
        </header>

        <div className="w-full max-w-7xl px-4 py-5 sm:px-5 lg:px-8">{children}</div>
      </main>
    </div>
  );
}

function NavIcon({ name }: { name: IconName }) {
  const common = { className: 'h-4 w-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' };

  switch (name) {
    case 'dashboard':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 13h6V4H4v9zm10 7h6v-9h-6v9zM4 20h6v-4H4v4zm10-12h6V4h-6v4z" />
        </svg>
      );
    case 'ticket':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      );
    case 'orders':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6m-7 4h8m-8 4h8m-8 4h5M6 3h12a2 2 0 012 2v14l-3-2-3 2-3-2-3 2-3-2V5a2 2 0 012-2z" />
        </svg>
      );
    case 'receipt':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 3h10a2 2 0 012 2v16l-4-2-3 2-3-2-4 2V5a2 2 0 012-2z" />
        </svg>
      );
    case 'users':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m6-6a3 3 0 11-6 0 3 3 0 016 0zm6 2a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'user':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0H5z" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.3 4.3c.4-1.7 2.9-1.7 3.4 0a1.7 1.7 0 002.5 1c1.5-.9 3.3.8 2.4 2.4a1.7 1.7 0 001 2.5c1.7.4 1.7 2.9 0 3.4a1.7 1.7 0 00-1 2.5c.9 1.5-.8 3.3-2.4 2.4a1.7 1.7 0 00-2.5 1c-.4 1.7-2.9 1.7-3.4 0a1.7 1.7 0 00-2.5-1c-1.5.9-3.3-.8-2.4-2.4a1.7 1.7 0 00-1-2.5c-1.7-.4-1.7-2.9 0-3.4a1.7 1.7 0 001-2.5c-.9-1.5.8-3.3 2.4-2.4a1.7 1.7 0 002.5-1z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'logs':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 11h8M8 15h5M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
        </svg>
      );
  }
}

function MenuIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
