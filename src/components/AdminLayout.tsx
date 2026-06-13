'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminLogoutButton } from '@/components/AdminLogoutButton';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Rifas', href: '/admin/rifas' },
    { name: 'Ordenes', href: '/admin/ordenes' },
    { name: 'Comprobantes', href: '/admin/comprobantes' },
    { name: 'Logs', href: '/admin/logs' },
    { name: 'Clientes', href: '/admin/clientes' },
    { name: 'Usuarios', href: '/admin/usuarios' },
  ];

  const currentTitle = navItems.find((item) => item.href === pathname)?.name || 'Panel';

  const linkClass = (href: string) =>
    `block rounded-lg px-3 py-2.5 text-sm transition-colors ${
      pathname === href
        ? 'bg-brand-500 font-bold text-white'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-slate-100 text-slate-950 dark:bg-[#0b1117] dark:text-slate-100">
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 dark:border-slate-800 dark:bg-[#0f1720] lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">interRIFAS</h2>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Administracion
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 lg:hidden"
              aria-label="Cerrar menu"
              title="Cerrar menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)} onClick={() => setIsOpen(false)}>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <AdminLogoutButton />
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col transition-all duration-300 lg:ml-72">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-slate-100/85 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-[#0b1117]/85 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition-transform active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:hidden"
              aria-label="Abrir menu"
              title="Abrir menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <h1 className="truncate text-base font-extrabold text-slate-900 dark:text-white lg:text-xl">{currentTitle}</h1>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-3 pr-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <span className="hidden text-xs font-bold uppercase tracking-wider text-slate-500 sm:inline">Admin</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-extrabold text-white">
              A
            </div>
          </div>
        </header>

        <div className="w-full max-w-7xl px-4 py-5 sm:px-5 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
