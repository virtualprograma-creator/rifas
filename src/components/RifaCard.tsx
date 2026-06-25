import Link from 'next/link';
import Image from 'next/image';
import { formatSpanishDate } from '@/lib/dates';

interface RifaProps {
  id: string;
  titulo: string;
  descripcionCorta: string;
  imagenUrl: string;
  precioBoleto: number;
  fechaSorteo: Date;
  boletosDisponibles: number;
  boletosTotales: number;
  estado?: string;
  ganadorBoleto?: string | null;
  ganadorCliente?: string | null;
  razonEstado?: string | null;
}

export function RifaCard({
  id,
  titulo,
  descripcionCorta,
  imagenUrl,
  precioBoleto,
  fechaSorteo,
  boletosDisponibles,
  boletosTotales,
  estado = 'ACTIVA',
  ganadorBoleto,
  ganadorCliente,
  razonEstado,
}: RifaProps) {
  const porcentajeVendido = boletosTotales > 0
    ? Math.min(100, Math.round(((boletosTotales - boletosDisponibles) / boletosTotales) * 100))
    : 0;
  const publicId = id.slice(-10).toUpperCase();
  const isFinalizada = estado === 'FINALIZADA';
  const isPausada = estado === 'PAUSADA';
  const isCancelada = estado === 'CANCELADA';
  const noActiva = isFinalizada || isPausada || isCancelada;
  const disponibilidadLabel = porcentajeVendido >= 85 ? 'Últimos boletos' : 'Disponible';

  return (
    <div className={`premium-card gold-shine group flex h-full flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-[#0b2419] ${noActiva ? 'opacity-90' : ''}`}>
      <Link href={`/rifas/${publicId}`} className="relative block aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9]">
        <Image
          src={imagenUrl || '/placeholder.jpg'}
          alt={titulo}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          unoptimized
          className={`h-full w-full object-cover transition-transform duration-500 ${noActiva ? 'grayscale-[30%]' : 'group-hover:scale-105'}`}
        />

        {isFinalizada && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]">
            <span className="rounded-full border border-white/30 bg-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-transform group-hover:scale-105 md:text-sm">
              Rifa finalizada
            </span>
          </div>
        )}

        {isPausada && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-amber-600 px-3 py-1 text-sm font-bold uppercase tracking-wider text-white">
              Pausado
            </span>
          </div>
        )}

        {isCancelada && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-bold uppercase tracking-wider text-white">
              Cancelado
            </span>
          </div>
        )}

        {!noActiva && (
          <>
            <div className="absolute right-3 top-3 rounded-full border border-white/45 bg-gold-300 px-3 py-1 text-sm font-black text-brand-900 shadow-lg shadow-gold-900/20">
              ${precioBoleto.toFixed(2)}
            </div>
            <div className="absolute left-3 top-3 rounded-full border border-white/35 bg-brand-900/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-gold-100 shadow-lg backdrop-blur-sm">
              {disponibilidadLabel}
            </div>
          </>
        )}
      </Link>

      <div className="relative z-10 flex flex-grow flex-col p-5">
        <h3 className="mb-2 text-xl font-black text-brand-900 dark:text-gold-100">
          <Link href={`/rifas/${publicId}`} className="hover:text-brand-700 dark:hover:text-gold-300 transition-colors">
            {titulo}
          </Link>
        </h3>
        <p className="mb-4 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{descripcionCorta}</p>

        <div className="mt-auto space-y-4">
          {!noActiva ? (
            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                <span>{boletosDisponibles} boletos disponibles</span>
                <span>{porcentajeVendido}% vendido</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
                <div className="progress-premium h-full rounded-full" style={{ width: `${porcentajeVendido}%` }} />
              </div>
            </div>
          ) : isFinalizada ? (
            <div className="flex min-h-[44px] flex-col justify-center rounded-lg border border-amber-200 bg-amber-50 p-2 text-center dark:border-amber-700/50 dark:bg-amber-900/20">
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Ganador: {ganadorCliente || 'Anónimo'}
              </p>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Boleto #{ganadorBoleto}</p>
            </div>
          ) : (
            <div className={`flex min-h-[44px] flex-col justify-center rounded-lg border p-2 text-center ${isPausada ? 'border-amber-100 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10' : 'border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10'}`}>
              <p className={`text-[11px] font-bold leading-tight ${isPausada ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>
                {razonEstado || (isPausada ? 'Venta pausada temporalmente' : 'Rifa cancelada')}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm font-medium">
            <span className="flex items-center text-slate-500 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatSpanishDate(fechaSorteo)}
            </span>
          </div>

          <Link
            href={`/rifas/${publicId}`}
            className={`block w-full rounded-xl border py-3 text-center font-bold shadow-md transition-all active:scale-[0.98] ${
              noActiva
                ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                : 'border-gold-300/20 bg-brand-600 text-white shadow-brand-500/20 hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-500/25'
            }`}
          >
            {isFinalizada ? 'Ver resultados' : isPausada ? 'Ver detalles' : isCancelada ? 'Saber más' : 'Ver rifa y boletos'}
          </Link>
        </div>
      </div>
    </div>
  );
}
