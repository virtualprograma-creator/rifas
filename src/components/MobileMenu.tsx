'use client';
import { useState } from 'react';
import Link from 'next/link';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center">
      {/* Etiqueta que actúa como el botón hamburguesa */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-white p-2 cursor-pointer select-none"
        aria-label="Alternar menú"
      >
        {/* Icono Hamburguesa (visible cuando no está marcado) */}
        {!isOpen ? (
          <svg className="w-8 h-8 block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        ) : (
          <svg className="w-8 h-8 block text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>

      {/* Menú Dropdown */}
      {isOpen && (
        <div className="flex absolute top-16 left-0 w-full h-[calc(100vh-64px)] bg-[#052d20] border-t border-gold-500/20 z-50 flex-col items-center pt-12 gap-8 shadow-2xl">
          <Link href="/" onClick={() => setIsOpen(false)} className="text-2xl font-bold text-white hover:text-gold-300">
            Inicio
          </Link>
          <Link href="/buscar-boletos" onClick={() => setIsOpen(false)} className="text-2xl font-bold text-white hover:text-gold-300">
            Buscar Boletos
          </Link>
          <Link href="/preguntas-frecuentes" onClick={() => setIsOpen(false)} className="text-2xl font-bold text-white hover:text-gold-300">
            Preguntas Frecuentes
          </Link>
        </div>
      )}
    </div>
  )
}
