'use client';

import { useEffect, useMemo, useState } from 'react';

export type EstadoBoleto = 'DISPONIBLE' | 'APARTADO' | 'PAGADO' | 'CANCELADO';

export interface BoletoType {
  id: string;
  numero: number;
  numeroFormateado: string;
  estado: EstadoBoleto;
}

interface BoletoGridProps {
  boletos: BoletoType[];
  onSeleccionChange: (seleccionados: BoletoType[]) => void;
  maxSeleccion?: number;
}

export function BoletoGrid({ boletos, onSeleccionChange, maxSeleccion = 10 }: BoletoGridProps) {
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [busqueda, setBusqueda] = useState('');
  const [cantidadSuerte, setCantidadSuerte] = useState(1);

  const busquedaNormalizada = busqueda.trim().replace(/^0+/, '');
  const boletosDisponibles = useMemo(() => boletos.filter((boleto) => boleto.estado === 'DISPONIBLE'), [boletos]);
  const maxSuerte = Math.min(maxSeleccion, boletosDisponibles.length);
  const cantidadSuerteActual = maxSuerte < 1 ? 0 : Math.min(maxSuerte, Math.max(1, cantidadSuerte));
  const seleccionadosArray = useMemo(() => boletos.filter((boleto) => seleccionados.has(boleto.id)), [boletos, seleccionados]);
  const boletosVisibles = busqueda.trim()
    ? boletos.filter((boleto) => {
        const numeroSinCeros = boleto.numero.toString();
        return (
          boleto.numeroFormateado.includes(busqueda.trim()) ||
          numeroSinCeros.includes(busquedaNormalizada || busqueda.trim())
        );
      })
    : boletos;

  useEffect(() => {
    onSeleccionChange(seleccionadosArray);
  }, [onSeleccionChange, seleccionadosArray]);

  const toggleBoleto = (boleto: BoletoType, checked?: boolean) => {
    if (boleto.estado !== 'DISPONIBLE') return;

    setSeleccionados((prev) => {
      const next = new Set(prev);
      const shouldSelect = checked ?? !next.has(boleto.id);

      if (shouldSelect) {
        if (next.size >= maxSeleccion) {
          alert(`Solo puedes seleccionar hasta ${maxSeleccion} boletos a la vez.`);
          return prev;
        }
        next.add(boleto.id);
      } else {
        next.delete(boleto.id);
      }

      return next;
    });
  };

  const cambiarCantidadSuerte = (delta: number) => {
    setCantidadSuerte((prev) => {
      if (maxSuerte < 1) return 0;
      return Math.min(maxSuerte, Math.max(1, prev + delta));
    });
  };

  const elegirALaSuerte = () => {
    if (maxSuerte < 1) return;

    const mezclados = [...boletosDisponibles].sort(() => Math.random() - 0.5);
    const elegidos = mezclados.slice(0, cantidadSuerteActual);
    setSeleccionados(new Set(elegidos.map((boleto) => boleto.id)));
  };

  const limpiarSeleccion = () => setSeleccionados(new Set());

  return (
    <div className="w-full">
      <div className="mb-5 rounded-2xl border border-gold-500/20 bg-slate-50 p-4 dark:bg-[#071710]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-gold-300">
              Lista de boletos
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              Elige tus números o deja que la suerte seleccione por ti.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-4 sm:items-center">
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => cambiarCantidadSuerte(-1)}
                disabled={cantidadSuerteActual <= 1 || maxSuerte < 1}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-700 text-2xl font-bold leading-none text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Restar boleto"
              >
                -
              </button>

              <div className="min-w-20 text-center">
                <div className="text-4xl font-black text-brand-900 dark:text-white">{cantidadSuerteActual}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Boletos</div>
              </div>

              <button
                type="button"
                onClick={() => cambiarCantidadSuerte(1)}
                disabled={cantidadSuerteActual >= maxSuerte || maxSuerte < 1}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-700 text-2xl font-bold leading-none text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Sumar boleto"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={elegirALaSuerte}
              disabled={maxSuerte < 1}
              className="min-h-11 rounded-full border-2 border-brand-700 bg-white px-7 text-sm font-extrabold uppercase tracking-widest text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gold-300 dark:bg-[#0b2419] dark:text-gold-100 dark:hover:bg-[#123527]"
            >
              Elegir a la suerte
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label htmlFor="buscar-boleto" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Buscar boleto
          </label>
          <div className="flex gap-2">
            <input
              id="buscar-boleto"
              type="search"
              inputMode="numeric"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              suppressHydrationWarning
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:ring-2 focus:ring-gold-300 dark:border-gold-500/30 dark:bg-[#071710] dark:text-white"
              placeholder="Ej. 15 o 0015"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-gold-500/30 dark:text-slate-200 dark:hover:bg-white/5"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
          {seleccionados.size}/{maxSeleccion} seleccionados
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex flex-wrap gap-3 text-slate-600 dark:text-slate-300">
          <LegendDot className="bg-[#062d20]" label="Disponible" />
          <LegendDot className="bg-gold-400" label="Seleccionado" />
          <LegendDot className="bg-amber-400" label="Apartado" />
          <LegendDot className="bg-red-400" label="Pagado" />
        </div>
        {seleccionados.size > 0 && (
          <button type="button" onClick={limpiarSeleccion} className="text-sm font-bold text-brand-600 hover:text-brand-500 dark:text-brand-300">
            Limpiar selección
          </button>
        )}
      </div>

      {seleccionadosArray.length > 0 && (
        <div className="mb-4 rounded-xl border border-gold-500/20 bg-gold-50/70 p-3 text-sm text-brand-900 dark:bg-gold-900/10 dark:text-gold-100">
          <span className="font-bold">Tus boletos:</span> {seleccionadosArray.map((boleto) => boleto.numeroFormateado).join(', ')}
        </div>
      )}

      <div className="max-h-[470px] overflow-y-auto rounded-xl border border-slate-200 bg-white/60 p-3 pr-2 dark:border-slate-800 dark:bg-slate-950/20">
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {boletosVisibles.map((boleto) => {
            const isSelected = seleccionados.has(boleto.id);
            return (
              <label
                key={boleto.id}
                className={boleto.estado === 'DISPONIBLE' ? 'relative block cursor-pointer' : 'relative block'}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={boleto.estado !== 'DISPONIBLE'}
                  onChange={(event) => toggleBoleto(boleto, event.target.checked)}
                  className="peer sr-only"
                  aria-label={`Boleto ${boleto.numeroFormateado} - ${boleto.estado}`}
                />
                <span
                  className={`flex min-h-[54px] select-none items-center justify-center rounded-lg border px-2 text-sm font-black shadow-sm transition-all duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-gold-300 sm:text-sm ${getStylesByEstado(boleto.estado, isSelected)}`}
                  title={`Boleto ${boleto.numeroFormateado} - ${boleto.estado}`}
                >
                  {boleto.numeroFormateado}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {boletosVisibles.length === 0 && (
        <div className="mt-3 rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
          No encontramos boletos con ese número.
        </div>
      )}
    </div>
  );
}

function getStylesByEstado(estado: EstadoBoleto, isSelected: boolean) {
  if (isSelected) {
    return 'bg-gold-400 text-brand-900 border-gold-500 scale-[1.03] shadow-gold-500/25';
  }

  switch (estado) {
    case 'DISPONIBLE':
      return 'bg-[#062d20] border-[#154332] text-white hover:-translate-y-0.5 hover:bg-brand-700 active:bg-brand-800';
    case 'APARTADO':
      return 'bg-amber-100 border-amber-200 text-amber-700 cursor-not-allowed dark:bg-amber-500/15 dark:border-amber-500/20 dark:text-amber-300';
    case 'PAGADO':
      return 'bg-red-100 border-red-200 text-red-700 cursor-not-allowed dark:bg-red-500/15 dark:border-red-500/20 dark:text-red-300';
    case 'CANCELADO':
      return 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-500';
    default:
      return 'bg-[#062d20] border-brand-700 text-white';
  }
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-full border border-black/10 ${className}`} />
      {label}
    </div>
  );
}
