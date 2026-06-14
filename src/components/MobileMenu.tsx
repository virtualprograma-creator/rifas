'use client';

import { useState } from 'react';
import Link from 'next/link';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer select-none p-2 text-white transition-colors hover:text-gold-300"
        aria-label="Alternar menú"
        aria-expanded={isOpen}
      >
        {!isOpen ? (
          <svg className="block h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        ) : (
          <svg className="block h-8 w-8 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-16 z-50 flex h-[calc(100vh-64px)] w-full flex-col items-center gap-8 border-t border-gold-500/20 bg-[#052d20] pt-12 shadow-2xl">
          <Link href="/" onClick={() => setIsOpen(false)} className="text-2xl font-bold text-white transition-colors hover:text-gold-300">
            Inicio
          </Link>
          <Link href="/buscar-boletos" onClick={() => setIsOpen(false)} className="text-2xl font-bold text-white transition-colors hover:text-gold-300">
            Buscar boletos
          </Link>
          <Link href="/preguntas-frecuentes" onClick={() => setIsOpen(false)} className="text-2xl font-bold text-white transition-colors hover:text-gold-300">
            Preguntas frecuentes
          </Link>
        </div>
      )}
    </div>
  );
}
