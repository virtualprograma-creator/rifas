'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { formatSpanishDate } from '@/lib/dates';

type BoletoResultado = {
  id: string;
  numeroFormateado: string;
  estado: string;
  estadoTexto: string;
  folio?: string | null;
  ordenUrl?: string | null;
  rifa: {
    id: string;
    titulo: string;
    precioBoleto: number;
    fechaSorteo: string;
  };
};

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

const estadoStyles: Record<string, string> = {
  DISPONIBLE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
  APARTADO: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
  PAGADO: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200',
  CANCELADO: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

export function BoletoSearch() {
  const [numero, setNumero] = useState('');
  const [boletos, setBoletos] = useState<BoletoResultado[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const buscarBoletos = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = numero.trim();
    if (!query) {
      setError('Ingresa un número de boleto');
      setBoletos([]);
      setHasSearched(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`/api/boletos/buscar?numero=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo buscar el boleto');
      }

      setBoletos(data.boletos ?? []);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo buscar el boleto');
      setBoletos([]);
      setHasSearched(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-12 rounded-2xl border border-gold-500/20 bg-white p-5 shadow-sm dark:bg-[#0b2419] sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-600 dark:text-gold-300">
            Consulta rápida
          </p>
          <h2 className="mt-2 text-2xl font-bold text-brand-900 dark:text-gold-100">Buscar boleto</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Escribe el folio o el número del boleto para ver la información de tu participación.
          </p>
        </div>

        <div>
          <form onSubmit={buscarBoletos} className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="search"
              inputMode="text"
              value={numero}
              onChange={(event) => setNumero(event.target.value)}
              className="min-h-12 rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:ring-2 focus:ring-gold-300 dark:border-gold-500/30 dark:bg-[#071710] dark:text-white"
              placeholder="Ej. 0057 o 30F9GYLFDQ"
              aria-label="Folio o número de boleto"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="min-h-12 rounded-xl bg-brand-700 px-6 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
              {error}
            </div>
          )}

          {hasSearched && (
            <div className="mt-4 space-y-3">
              {boletos.length === 0 ? (
                <div className="rounded-xl border border-slate-200 px-4 py-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No encontramos información con ese folio o número de boleto.
                </div>
              ) : (
                boletos.map((boleto) => (
                  <div
                    key={boleto.id}
                    className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#071710] sm:grid-cols-[auto_1fr_auto] sm:items-center"
                  >
                    <div className="flex h-14 min-w-20 items-center justify-center rounded-lg border border-gold-500/30 bg-white px-4 text-xl font-extrabold text-brand-900 dark:bg-[#0b2419] dark:text-gold-100">
                      {boleto.numeroFormateado}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/rifas/${boleto.rifa.id.slice(-10).toUpperCase()}`}
                        className="font-semibold text-brand-800 hover:text-brand-600 dark:text-gold-100 dark:hover:text-gold-300"
                      >
                        {boleto.rifa.titulo}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {currencyFormatter.format(boleto.rifa.precioBoleto)} - Rifa {formatSpanishDate(boleto.rifa.fechaSorteo)}
                      </p>
                      {boleto.folio && (
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Folio: {boleto.folio}
                          {boleto.ordenUrl && (
                            <Link href={boleto.ordenUrl} className="ml-3 text-brand-700 hover:text-brand-600 dark:text-gold-300">
                              Ver información
                            </Link>
                          )}
                        </p>
                      )}
                    </div>
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                        estadoStyles[boleto.estado] ?? estadoStyles.CANCELADO
                      }`}
                    >
                      {boleto.estadoTexto}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
