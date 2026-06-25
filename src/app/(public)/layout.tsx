import Link from 'next/link';
import { MobileMenu } from '@/components/MobileMenu';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="border-b border-gold-500/25 bg-[#052d20] shadow-sm">
        <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0 flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400 shadow-lg shadow-gold-500/30">
              <svg className="h-6 w-6 text-brand-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <span className="text-2xl md:text-[26px] font-black tracking-tight text-white">
              inter<span className="text-gold-300">RIFAS</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm font-semibold text-brand-50 transition-colors hover:text-gold-300">
              Inicio
            </Link>
            <Link href="/buscar-boletos" className="text-sm font-semibold text-brand-50 transition-colors hover:text-gold-300">
              Buscar boletos
            </Link>
            <Link href="/preguntas-frecuentes" className="text-sm font-semibold text-brand-50 transition-colors hover:text-gold-300">
              Preguntas frecuentes
            </Link>
            <Link href="/admin" className="text-sm font-semibold text-brand-50 transition-colors hover:text-gold-300">
              Administración
            </Link>
          </div>

          <MobileMenu />
        </div>
      </nav>

      <div className="grow">{children}</div>

      <footer className="border-t border-gold-500/20 bg-[#052d20] px-4 py-8 text-center">
        <p className="text-sm text-brand-100/70">
          Designers by <span className="font-semibold text-gold-300">Yelsoft Media Studios</span> 2026. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
