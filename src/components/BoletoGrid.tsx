'use client';

import { useEffect, useState } from 'react';

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
  const boletosDisponibles = boletos.filter((boleto) => boleto.estado === 'DISPONIBLE');
  const maxSuerte = Math.min(maxSeleccion, boletosDisponibles.length);
  const cantidadSuerteActual = maxSuerte < 1 ? 0 : Math.min(maxSuerte, Math.max(1, cantidadSuerte));
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
    const seleccionadosArray = boletos.filter((boleto) => seleccionados.has(boleto.id));
    onSeleccionChange(seleccionadosArray);
  }, [boletos, onSeleccionChange, seleccionados]);

  const toggleBoleto = (boleto: BoletoType, checked?: boolean) => {
    if (boleto.estado !== 'DISPONIBLE') return;

    setSeleccionados((prev) => {
      const newSeleccionados = new Set(prev);
      const shouldSelect = checked ?? !newSeleccionados.has(boleto.id);

      if (shouldSelect) {
        if (newSeleccionados.size >= maxSeleccion) {
          alert(`Solo puedes seleccionar hasta ${maxSeleccion} boletos a la vez.`);
          return prev;
        }
        newSeleccionados.add(boleto.id);
      } else {
        newSeleccionados.delete(boleto.id);
      }

      return newSeleccionados;
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

    const cantidad = cantidadSuerteActual;
    const mezclados = [...boletosDisponibles].sort(() => Math.random() - 0.5);
    const elegidos = mezclados.slice(0, cantidad);

    setSeleccionados(new Set(elegidos.map((boleto) => boleto.id)));
  };

  const getStylesByEstado = (estado: EstadoBoleto, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-gold-400 text-brand-900 border-gold-500';
    }
    
    switch (estado) {
      case 'DISPONIBLE':
        return 'bg-[#062d20] border-[#154332] text-white active:bg-brand-700 cursor-pointer';
      case 'APARTADO':
        return 'bg-[#3a2034] border-[#5a223d] text-[#d65b78] cursor-not-allowed';
      case 'PAGADO':
        return 'bg-[#3a2034] border-[#5a223d] text-[#ff6b73] cursor-not-allowed';
      case 'CANCELADO':
        return 'bg-slate-700/40 border-slate-600/50 text-slate-400 cursor-not-allowed line-through';
      default:
        return 'bg-[#062d20] border-brand-700 text-white';
      }
    };

  return (
    <div className="w-full">
      <div className="mb-5 rounded-2xl border border-gold-500/20 bg-slate-50 p-4 dark:bg-[#071710]">
        <div className="flex flex-col items-center text-center gap-6 sm:flex-row sm:justify-between sm:text-left">
          <div className="flex flex-col items-center sm:items-start">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-gold-300">
              Lista de boletos
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Elige cuantos boletos quieres y déjale la selección a la suerte.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            {/* Controles de más y menos */}
            <div className="flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => cambiarCantidadSuerte(-1)}
                disabled={cantidadSuerteActual <= 1 || maxSuerte < 1}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-700 text-3xl font-bold leading-none text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Restar boleto"
              >
                -
              </button>

              <div className="min-w-20 text-center">
                <div className="text-4xl font-extrabold text-brand-900 dark:text-white">{cantidadSuerteActual}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Boletos</div>
              </div>

              <button
                type="button"
                onClick={() => cambiarCantidadSuerte(1)}
                disabled={cantidadSuerteActual >= maxSuerte || maxSuerte < 1}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-700 text-3xl font-bold leading-none text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Sumar boleto"
              >
                +
              </button>
            </div>

            {/* Botón Elegir a la suerte */}
            <button
              type="button"
              onClick={elegirALaSuerte}
              disabled={maxSuerte < 1}
              className="w-full sm:w-auto min-h-[48px] rounded-full border-2 border-brand-700 bg-white px-8 text-sm font-extrabold uppercase tracking-widest text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gold-300 dark:bg-[#0b2419] dark:text-gold-100 dark:hover:bg-[#123527]"
            >
              Elegir a la suerte
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <label htmlFor="buscar-boleto" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
              className="min-h-11 w-full rounded-xl border border-slate-300 dark:border-gold-500/30 bg-white dark:bg-[#071710] px-4 text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold-300"
              placeholder="Ej. 15 o 0015"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="min-h-11 rounded-xl border border-slate-300 dark:border-gold-500/30 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
        <div className="text-sm font-medium text-slate-500 sm:text-right">
          {seleccionados.size}/{maxSeleccion} seleccionados
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 text-xs sm:text-sm flex-wrap gap-2">
        <div className="flex gap-3 sm:gap-4">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-white border border-slate-300"></span> Disponible</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gold-400"></span> Seleccionado</div>
        </div>
        <div className="flex gap-3 sm:gap-4">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Apartado</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400"></span> No Disponible</div>
        </div>
      </div>
      
      <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar rounded-lg border border-transparent dark:border-slate-800/50">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2.5">
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
                  className="sr-only peer"
                  aria-label={`Boleto ${boleto.numeroFormateado} - ${boleto.estado}`}
                />
                <span
                  className={`
                    min-h-[58px] flex items-center justify-center rounded-lg px-2 text-base sm:text-sm font-bold 
                    border transition-colors duration-150 select-none pointer-events-none
                    ${getStylesByEstado(boleto.estado, isSelected)}
                  `}
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
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center text-sm text-slate-500">
          No encontramos boletos con ese numero.
        </div>
      )}
    </div>
  );
}
