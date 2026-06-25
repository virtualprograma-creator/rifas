'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type OrderLockScreenProps = {
  onVerify: (phone: string) => Promise<{ success: boolean; error?: string }>;
};

export function OrderLockScreen({ onVerify }: OrderLockScreenProps) {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = phone.trim();
    if (!query) {
      setError('Por favor ingresa tu número de teléfono.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const result = await onVerify(query);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || 'El número de teléfono no coincide.');
      }
    } catch (err) {
      console.error('Error verificando teléfono:', err);
      setError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#eef8f2] px-4 py-16 dark:bg-[#071710] flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 dark:border-slate-800 dark:bg-[#0b2419] text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:bg-gold-500/10 dark:text-gold-300">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-gold-100">Acceso Protegido</h2>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
          Para proteger la privacidad de tu comprobante de pago e información personal, por favor ingresa el número de teléfono con el que realizaste el apartado.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <div>
            <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Número de Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 7441526352"
              className="w-full min-h-12 rounded-xl border border-slate-350 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-[#071710] dark:text-white"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-12 rounded-xl bg-brand-600 text-white font-extrabold uppercase tracking-wide hover:bg-brand-500 transition active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading ? 'Verificando...' : 'Verificar y Continuar'}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Link
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-brand-600 dark:text-slate-500 dark:hover:text-gold-300 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
