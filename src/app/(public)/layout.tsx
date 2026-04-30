import Link from 'next/link';
import { MobileMenu } from '@/components/MobileMenu';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-[#052d20] border-b border-gold-500/25 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo - Izquierda */}
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
            <div className="w-8 h-8 bg-gold-400 rounded-lg flex items-center justify-center shadow-lg shadow-gold-500/30">
              <svg className="w-5 h-5 text-brand-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">inter<span className="text-gold-300">RIFAS</span></span>
          </Link>

          {/* Navegación Desktop - Centro/Derecha */}
          <div className="hidden md:flex gap-8 items-center">
            <Link href="/" className="text-sm font-semibold text-brand-50 hover:text-gold-300 transition-colors">
              Inicio
            </Link>
            <Link href="/buscar-boletos" className="text-sm font-semibold text-brand-50 hover:text-gold-300 transition-colors">
              Buscar boletos
            </Link>
            <Link href="/preguntas-frecuentes" className="text-sm font-semibold text-brand-50 hover:text-gold-300 transition-colors">
              Preguntas frecuentes
            </Link>
          </div>

          {/* Menú Móvil - Derecha */}
          <MobileMenu />

        </div>
      </nav>
      
      <div className="flex-grow">
        {children}
      </div>

      <footer className="bg-[#052d20] border-t border-gold-500/20 py-8 px-4 text-center">
        <p className="text-brand-100/70 text-sm">
          Designers by <span className="font-semibold text-gold-300">Yelsoft Media Studios</span> 2026. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
