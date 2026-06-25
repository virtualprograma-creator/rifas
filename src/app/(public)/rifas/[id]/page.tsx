import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { RifaClientView } from '@/components/RifaClientView';
import type { BoletoType, EstadoBoleto } from '@/components/BoletoGrid';
import { formatSpanishDate } from '@/lib/dates';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RifaDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const normalizedId = id.toLowerCase();

  const rifa = await prisma.rifa.findFirst({
    where: normalizedId.length === 10 ? { id: { endsWith: normalizedId } } : { id },
    include: {
      boletos: {
        orderBy: { numero: 'asc' },
      },
    },
  });

  if (!rifa) {
    notFound();
  }

  const disponibles = rifa.boletos.filter((boleto) => boleto.estado === 'DISPONIBLE').length;
  const vendidos = rifa.cantidadBoletos - disponibles;
  const porcentaje = rifa.cantidadBoletos > 0 ? Math.min(100, Math.round((vendidos / rifa.cantidadBoletos) * 100)) : 0;
  const boletos: BoletoType[] = rifa.boletos.map((boleto) => ({
    id: boleto.id,
    numero: boleto.numero,
    numeroFormateado: boleto.numeroFormateado,
    estado: boleto.estado as EstadoBoleto,
  }));

  const status = getRifaStatus(rifa.estado);
  const mostrarEstadisticasPublicas = !rifa.ocultarEstadisticasPublicas;

  return (
    <main className="min-h-screen bg-[#f4f7f1] pb-20 pt-6 dark:bg-[#071710] sm:pt-10">
      <div className="mx-auto max-w-6xl px-4">
        <section className="premium-card rounded-3xl bg-white p-4 shadow-xl dark:bg-[#0b2419] sm:p-6 lg:p-8">
          <div className="relative z-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <div className="flex max-w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-2 dark:border-slate-800/80 dark:bg-slate-900/40 md:p-4 lg:col-span-5">
              <div className="relative h-auto w-full">
                <Image
                  src={rifa.imagenUrl || '/placeholder.jpg'}
                  alt={rifa.titulo}
                  width={900}
                  height={650}
                  priority
                  sizes="(min-width: 1024px) 420px, 100vw"
                  unoptimized
                  className="h-auto max-h-[450px] w-full rounded-xl object-contain shadow-sm transition-transform duration-300 hover:scale-[1.02]"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between py-1 lg:col-span-7">
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${status.className}`}>
                    {status.label}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-gold-500 dark:text-gold-300">
                    <CalendarIcon />
                    Sorteo: {formatSpanishDate(rifa.fechaSorteo)}
                  </span>
                </div>

                <h1 className="mb-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
                  {rifa.titulo}
                </h1>

                <p className="mb-6 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  {rifa.descripcionCorta}
                </p>
              </div>

              {rifa.estado === 'ACTIVA' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    <Metric label="Precio" value={`$${rifa.precioBoleto.toFixed(2)}`} tone="gold" />
                    <Metric label="Boletos" value={rifa.cantidadBoletos.toString()} tone="slate" />
                    {mostrarEstadisticasPublicas && (
                      <Metric label="Disponibles" value={disponibles.toString()} tone="green" />
                    )}
                  </div>

                  {mostrarEstadisticasPublicas && (
                    <div>
                      <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Progreso de venta</span>
                        <span>{vendidos}/{rifa.cantidadBoletos}</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-black/5 dark:bg-slate-900/60 dark:ring-white/10">
                        <div className="progress-premium h-full rounded-full" style={{ width: `${porcentaje}%` }} />
                      </div>
                    </div>
                  )}

                  <a
                    href="#comprar-boletos"
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-brand-600/15 transition-all hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-brand-600/25 active:scale-[0.98] sm:w-auto"
                  >
                    Ver y seleccionar boletos
                    <ArrowDownIcon />
                  </a>
                </div>
              ) : (
                <UnavailablePanel estado={rifa.estado} razon={rifa.razonEstado} />
              )}
            </div>
          </div>
        </section>

        <section className="premium-card mt-8 rounded-3xl bg-white p-6 shadow-xl dark:bg-[#0b2419] md:p-8">
          <div className="relative z-10">
            <h2 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-xl font-bold text-slate-800 dark:border-slate-800/80 dark:text-gold-100">
              <DocumentIcon />
              Detalles del sorteo
            </h2>
            <p className="whitespace-pre-line text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {rifa.descripcionCompleta}
            </p>
          </div>
        </section>

        {rifa.estado === 'ACTIVA' ? (
          <div id="comprar-boletos" className="mt-8 scroll-mt-6">
            <RifaClientView rifaId={rifa.id} precioBoleto={rifa.precioBoleto} boletos={boletos} />
          </div>
        ) : rifa.estado === 'FINALIZADA' ? (
          <WinnerPanel ganadorCliente={rifa.ganadorCliente} ganadorBoleto={rifa.ganadorBoleto} />
        ) : (
          <section className="mt-8 rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Rifa no disponible</h2>
            <p className="text-slate-500">Esta rifa está {rifa.estado.toLowerCase()} y no acepta apartados por ahora.</p>
          </section>
        )}
      </div>
    </main>
  );
}

function getRifaStatus(estado: string) {
  switch (estado) {
    case 'ACTIVA':
      return { label: 'Activa', className: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300' };
    case 'PAUSADA':
      return { label: 'Pausada', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' };
    case 'FINALIZADA':
      return { label: 'Finalizada', className: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200' };
    default:
      return { label: 'Cancelada', className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300' };
  }
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'gold' | 'slate' | 'green' | 'brand' }) {
  const toneClass = {
    gold: 'text-gold-500 dark:text-gold-400',
    slate: 'text-slate-800 dark:text-slate-200',
    green: 'text-green-600 dark:text-green-400',
    brand: 'text-brand-600 dark:text-brand-400',
  }[tone];

  return (
    <div className="rounded-xl border border-slate-100 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/30">
      <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`truncate text-2xl font-black ${toneClass}`}>{value}</div>
    </div>
  );
}

function UnavailablePanel({ estado, razon }: { estado: string; razon: string | null }) {
  const isPaused = estado === 'PAUSADA';

  return (
    <div className={`rounded-xl border p-6 text-center ${isPaused ? 'border-amber-200/60 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-950/30' : 'border-red-200/60 bg-red-50 dark:border-red-800/30 dark:bg-red-950/30'}`}>
      <h3 className={`mb-2 text-xl font-bold ${isPaused ? 'text-amber-800 dark:text-amber-300' : 'text-red-800 dark:text-red-300'}`}>
        {isPaused ? 'Rifa pausada' : estado === 'FINALIZADA' ? 'Rifa concluida' : 'Rifa cancelada'}
      </h3>
      <p className={isPaused ? 'text-amber-700 dark:text-amber-200' : 'text-red-700 dark:text-red-200'}>
        {razon || (isPaused ? 'Esta rifa se encuentra pausada temporalmente. Por favor, vuelve más tarde.' : 'Esta rifa no está aceptando apartados.')}
      </p>
    </div>
  );
}

function WinnerPanel({ ganadorCliente, ganadorBoleto }: { ganadorCliente: string | null; ganadorBoleto: string | null }) {
  return (
    <section className="premium-card mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100 p-10 text-center shadow-lg dark:from-amber-900/20 dark:to-amber-900/10">
      <div className="relative z-10">
        <span className="mb-6 inline-block rounded-full bg-amber-500 px-4 py-1.5 text-sm font-black uppercase tracking-widest text-white shadow-md">
          Rifa finalizada
        </span>
        <h2 className="mb-4 text-3xl font-black text-brand-900 dark:text-white md:text-5xl">Tenemos un ganador</h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-amber-800 dark:text-amber-200 md:text-xl">
          Felicidades al ganador de la rifa. Gracias a todos por su participación.
        </p>

        <div className="mx-auto max-w-lg rounded-2xl border border-gold-500/30 bg-white p-6 shadow-xl transition-transform duration-300 hover:scale-[1.02] dark:bg-slate-800 md:p-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-gold-300 bg-gold-100 text-gold-500 dark:bg-gold-900/30">
            <SparkleIcon />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{ganadorCliente || 'Anónimo'}</h3>
          <p className="mb-4 mt-1 text-slate-500 dark:text-slate-400">Boleto ganador</p>
          <div className="inline-block rounded-xl bg-brand-900 px-6 py-2 font-mono text-3xl font-bold tracking-widest text-gold-400 shadow-inner">
            #{ganadorBoleto}
          </div>
        </div>
      </div>
    </section>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="h-5 w-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6a1 1 0 01.7.3l5.4 5.4a1 1 0 01.3.7V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.3 6.9L21 12l-5.7 2.1L13 21l-2.3-6.9L5 12l5.7-2.1L13 3z" />
    </svg>
  );
}
