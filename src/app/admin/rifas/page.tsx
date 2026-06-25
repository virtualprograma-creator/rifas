import Link from 'next/link';
import { AdminLayout } from '@/components/AdminLayout';
import { RifaQuickActions } from '@/components/RifaQuickActions';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

type Props = {
  searchParams: Promise<{ q?: string; estado?: string; tab?: string }>;
};

export default async function AdminRifasPage({ searchParams }: Props) {
  const { q = '', estado = '', tab = 'rifas' } = await searchParams;
  const query = q.trim();
  const estadoFiltro = estado.trim().toUpperCase();
  const enPapelera = tab === 'papelera';

  // Contadores globales (independientes de filtros de búsqueda)
  const [totalRifasActivas, totalPapelera] = await Promise.all([
    prisma.rifa.count({ where: { estado: { not: 'CANCELADA' } } }),
    prisma.rifa.count({ where: { estado: 'CANCELADA' } }),
  ]);

  const rifas = await prisma.rifa.findMany({
    where: {
      ...(enPapelera
        ? { estado: 'CANCELADA' }
        : estadoFiltro
          ? { estado: estadoFiltro }
          : { estado: { not: 'CANCELADA' } }),
      ...(query
        ? {
            OR: [
              { titulo: { contains: query } },
              { categoria: { contains: query } },
              { descripcionCorta: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          boletos: { where: { estado: { in: ['APARTADO', 'PAGADO'] } } },
          ordenes: true,
        },
      },
    },
  });

  const activas = enPapelera ? 0 : rifas.filter((rifa) => rifa.estado === 'ACTIVA').length;
  const pausadas = enPapelera ? 0 : rifas.filter((rifa) => rifa.estado === 'PAUSADA').length;
  const ordenes = rifas.reduce((sum, rifa) => sum + rifa._count.ordenes, 0);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Rifas" value={totalRifasActivas.toString()} tone="blue" />
          <StatCard label="Activas" value={activas.toString()} tone="green" />
          <StatCard label="Pausadas" value={pausadas.toString()} tone="amber" />
          <StatCard label="Órdenes" value={ordenes.toString()} tone="yellow" />
        </div>

        <section className="premium-card rounded-2xl bg-white p-4 shadow-sm dark:bg-[#101923] sm:p-5">
          <div className="relative z-10 mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Rifas</h2>
              <p className="mt-1 text-sm text-slate-500">Administra sorteos, boletos, visibilidad pública y órdenes.</p>
            </div>
            {!enPapelera && (
              <Link
                href="/admin/rifas/nueva"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-500 active:scale-[0.98]"
              >
                Nueva rifa
              </Link>
            )}
          </div>

          {/* Pestañas */}
          <div className="relative z-10 mb-5 flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800/60">
            <Link
              href="/admin/rifas"
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                !enPapelera
                  ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Rifas
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${!enPapelera ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                {totalRifasActivas}
              </span>
            </Link>
            <Link
              href="/admin/rifas?tab=papelera"
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                enPapelera
                  ? 'bg-white shadow-sm text-red-600 dark:bg-slate-700 dark:text-red-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Papelera
              {totalPapelera > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${enPapelera ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'}`}>
                  {totalPapelera}
                </span>
              )}
            </Link>
          </div>

          <form className="relative z-10 mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_170px] lg:grid-cols-[1fr_180px_auto]">
            <input type="hidden" name="tab" value={tab} />
            <input
              name="q"
              defaultValue={query}
              className="min-h-11 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              placeholder={enPapelera ? 'Buscar en la papelera…' : 'Buscar título, categoría o descripción'}
            />
            {!enPapelera && (
              <select
                name="estado"
                defaultValue={estadoFiltro}
                className="min-h-11 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              >
                <option value="">Todas</option>
                <option value="ACTIVA">Activa</option>
                <option value="PAUSADA">Pausada</option>
                <option value="FINALIZADA">Finalizada</option>
              </select>
            )}
            <button className={`min-h-11 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-500 active:scale-[0.98] ${enPapelera ? 'sm:col-span-1' : 'sm:col-span-2 lg:col-span-1'}`}>
              Filtrar
            </button>
          </form>

          {enPapelera && (
            <div className="relative z-10 mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Las rifas en la papelera están ocultas al público. Puedes restaurarlas en cualquier momento.
            </div>
          )}

          <div className="relative z-10 space-y-3 lg:hidden">
            {rifas.map((rifa) => {
              const progress = progressPercent(rifa._count.boletos, rifa.cantidadBoletos);

              return (
                <article key={rifa.id} className={`rounded-xl border p-4 shadow-sm ${enPapelera ? 'border-red-200 bg-red-50/50 dark:border-red-500/20 dark:bg-red-500/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/30'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-base font-black text-slate-900 dark:text-slate-100">{rifa.titulo}</h3>
                      <p className="mt-1 truncate text-xs text-slate-500">{rifa.categoria}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${statusClass(rifa.estado)}`}>
                      {statusLabel(rifa.estado)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {rifa.ocultarEstadisticasPublicas && (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        Stats ocultas
                      </span>
                    )}
                    {rifa.ganadorBoleto && (
                      <span className="rounded-full bg-gold-100 px-2 py-1 text-[11px] font-bold text-gold-700 dark:bg-gold-500/15 dark:text-gold-300">
                        Ganador #{rifa.ganadorBoleto}
                      </span>
                    )}
                    {rifa.razonEstado && enPapelera && (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-[11px] font-bold text-red-700 dark:bg-red-500/15 dark:text-red-300">
                        {rifa.razonEstado}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-bold uppercase tracking-wide text-slate-400">Boletos</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {rifa._count.boletos}/{rifa.cantidadBoletos}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="progress-premium h-full rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <Info label="Órdenes" value={rifa._count.ordenes.toString()} />
                    <Info label="Precio" value={currencyFormatter.format(rifa.precioBoleto)} />
                    <Info label="Sorteo" value={new Date(rifa.fechaSorteo).toLocaleDateString('es-MX')} />
                  </dl>

                  <div className="mt-4 grid gap-2">
                    <Link
                      href={`/admin/rifas/${rifa.id}`}
                      className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-700 px-3 text-sm font-bold text-white"
                    >
                      Gestionar
                    </Link>
                    <RifaQuickActions rifaId={rifa.id} estadoActual={rifa.estado} />
                  </div>
                </article>
              );
            })}
            {rifas.length === 0 && (
              <EmptyState text={enPapelera ? 'La papelera está vacía.' : 'No hay rifas creadas aún.'} />
            )}
          </div>

          <div className="relative z-10 hidden overflow-x-auto lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <TableHead>Título</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Precio · Boletos · Disponibles</TableHead>
                  <TableHead>Órdenes</TableHead>
                  <TableHead>Sorteo</TableHead>
                  <TableHead>Acciones</TableHead>
                </tr>
              </thead>
              <tbody>
                {rifas.map((rifa) => {
                  const progress = progressPercent(rifa._count.boletos, rifa.cantidadBoletos);

                  return (
                    <tr key={rifa.id} className={`border-b border-slate-100 transition-colors last:border-0 ${enPapelera ? 'hover:bg-red-50/40 dark:hover:bg-red-500/5' : 'hover:bg-slate-50 dark:hover:bg-white/5'} dark:border-slate-800`}>
                      <td className="max-w-80 px-4 py-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{rifa.titulo}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-slate-500">{rifa.categoria}</span>
                          {rifa.ocultarEstadisticasPublicas && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              Stats ocultas
                            </span>
                          )}
                          {rifa.razonEstado && enPapelera && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-500/15 dark:text-red-400">
                              {rifa.razonEstado}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(rifa.estado)}`}>
                          {statusLabel(rifa.estado)}
                        </span>
                      </td>
                      <td className="min-w-64 px-4 py-3">
                        <div className="mb-1.5 flex items-center gap-3 text-xs">
                          <span className="font-black text-slate-800 dark:text-slate-100">{currencyFormatter.format(rifa.precioBoleto)}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500">{rifa._count.boletos}/{rifa.cantidadBoletos} boletos</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500">{rifa.cantidadBoletos - rifa._count.boletos} disp.</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div className="progress-premium h-full rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">{rifa._count.ordenes}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {new Date(rifa.fechaSorteo).toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-4">
                          <Link href={`/admin/rifas/${rifa.id}`} className="text-sm font-bold text-brand-600 hover:text-brand-500">
                            Gestionar
                          </Link>
                          <RifaQuickActions rifaId={rifa.id} estadoActual={rifa.estado} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rifas.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState text={enPapelera ? 'La papelera está vacía.' : 'No hay rifas creadas aún.'} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: 'green' | 'amber' | 'blue' | 'yellow' }) {
  const toneMap = {
    green: { text: 'text-emerald-500', dot: 'bg-emerald-400', glow: 'from-emerald-500/15' },
    amber: { text: 'text-amber-400', dot: 'bg-amber-300', glow: 'from-amber-500/15' },
    blue: { text: 'text-cyan-400', dot: 'bg-cyan-300', glow: 'from-cyan-500/15' },
    yellow: { text: 'text-gold-300', dot: 'bg-gold-300', glow: 'from-gold-500/15' },
  };
  const toneClass = toneMap[tone];

  return (
    <div className="relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/80 p-4 shadow-sm ring-1 ring-slate-900/5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-[#111b24]/80 dark:ring-white/5">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${toneClass.glow} to-transparent`} />
      <div className="relative flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${toneClass.dot}`} aria-hidden="true" />
        <div className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{label}</div>
      </div>
      <div className={`relative mt-2 truncate text-2xl font-black leading-none ${toneClass.text}`}>{value}</div>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-sm font-bold text-slate-500">{children}</th>;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 truncate font-bold text-slate-700 dark:text-slate-200">{value}</dd>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500 dark:border-slate-800">{text}</div>;
}

function progressPercent(current: number, total: number) {
  return Math.min(100, Math.round((current / Math.max(total, 1)) * 100));
}

function statusClass(status: string) {
  switch (status) {
    case 'ACTIVA':
      return 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300';
    case 'PAUSADA':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
    case 'FINALIZADA':
      return 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300';
    case 'CANCELADA':
      return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
  }
}

function statusLabel(status: string) {
  return status === 'CANCELADA' ? 'ELIMINADA' : status;
}
