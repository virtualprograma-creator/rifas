'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminLogoutButton } from '@/components/AdminLogoutButton';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Rifas', href: '/admin/rifas' },
    { name: 'Ordenes', href: '/admin/ordenes' },
    { name: 'Comprobantes', href: '/admin/comprobantes' },
    { name: 'Logs', href: '/admin/logs' },
    { name: 'Clientes', href: '/admin/clientes' },
    { name: 'Usuarios', href: '/admin/usuarios' },
  ];

  const linkClass = (href: string) =>
    `block px-4 py-3 rounded-xl transition-all duration-200 ${
      pathname === href
        ? 'bg-gold-500 text-brand-950 font-bold shadow-lg shadow-gold-500/20'
        : 'text-brand-50 hover:bg-brand-700/50 hover:text-gold-100'
    }`;

  return (
    <div className="min-h-screen bg-[#f4f7f1] dark:bg-[#071710] flex overflow-x-hidden">
      {/* Overlay para móviles */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Barra Lateral (Sidebar) */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-[#052d20] text-white shrink-0 z-50 border-r border-gold-500/20 transition-transform duration-300 transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-gold-500/20 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gold-300 tracking-tight">interRIFAS</h2>
              <p className="text-[10px] uppercase tracking-[0.25em] text-brand-100/60 mt-1 font-semibold">
                Control Panel
              </p>
            </div>
            <button 
              onClick={toggleSidebar} 
              className="lg:hidden text-gold-300 p-2 hover:bg-white/10 rounded-lg"
              aria-label="Cerrar menú"
              title="Cerrar menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)} onClick={() => setIsOpen(false)}>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t border-gold-500/10 bg-brand-950/30">
             <AdminLogoutButton />
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-72">
        <header className="sticky top-0 z-30 flex justify-between items-center p-4 lg:p-6 bg-[#f4f7f1]/80 dark:bg-[#071710]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2.5 bg-brand-900 text-gold-300 rounded-xl shadow-md border border-gold-500/20 active:scale-95 transition-transform"
              aria-label="Abrir menú"
              title="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <h1 className="text-xl lg:text-2xl font-bold text-brand-900 dark:text-gold-100 hidden sm:block">
              {navItems.find((n) => n.href === pathname)?.name || 'Panel'}
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-[#0b2419] py-1.5 pl-4 pr-1.5 rounded-full shadow-sm border border-gold-500/10">
            <span className="text-xs font-bold text-brand-800 dark:text-brand-100/70 uppercase tracking-wider hidden xs:inline">Admin</span>
            <div className="w-9 h-9 bg-linear-to-br from-gold-300 to-gold-500 rounded-full flex items-center justify-center text-brand-950 font-bold shadow-inner">
              A
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
