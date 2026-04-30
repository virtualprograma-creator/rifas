import Link from 'next/link';
import { AdminLogoutButton } from '@/components/AdminLogoutButton';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const linkClass =
    'block px-4 py-3 rounded-xl hover:bg-brand-700/70 hover:text-gold-100 transition-colors';

  return (
    <div className="min-h-screen bg-[#f4f7f1] dark:bg-[#071710] flex">
      <aside className="w-64 bg-[#052d20] text-white flex-shrink-0 fixed h-full z-10 border-r border-gold-500/20">
        <div className="p-6 border-b border-gold-500/20">
          <h2 className="text-2xl font-bold text-gold-300">interRIFAS</h2>
          <p className="text-xs uppercase tracking-[0.18em] text-brand-100/70 mt-1">Admin</p>
        </div>
        <nav className="p-4 space-y-2 text-brand-50">
          <Link href="/admin" className={linkClass}>
            Dashboard
          </Link>
          <Link href="/admin/rifas" className={linkClass}>
            Rifas
          </Link>
          <Link href="/admin/ordenes" className={linkClass}>
            Ordenes
          </Link>
          <Link href="/admin/comprobantes" className={linkClass}>
            Comprobantes
          </Link>
          <Link href="/admin/logs" className={linkClass}>
            Logs
          </Link>
          <Link href="/admin/clientes" className={linkClass}>
            Clientes
          </Link>
          <Link href="/admin/usuarios" className={linkClass}>
            Usuarios
          </Link>
        </nav>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8 bg-white/90 dark:bg-[#0b2419] p-4 rounded-2xl shadow-sm border border-gold-500/20 dark:border-gold-300/20">
          <h1 className="text-xl font-bold text-brand-900 dark:text-gold-100">Panel de Control</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 dark:text-brand-100/70">Admin</span>
            <div className="w-10 h-10 bg-gold-400 rounded-full flex items-center justify-center text-brand-900 font-bold">
              A
            </div>
            <AdminLogoutButton />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
