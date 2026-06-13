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
  searchParams: Promise<{ q?: string; estado?: string }>;
};

export default async function AdminRifasPage({ searchParams }: Props) {
  const { q = '', estado = '' } = await searchParams;
  const query = q.trim();
  const estadoFiltro = estado.trim().toUpperCase();

  const rifas = await prisma.rifa.findMany({
    where: {
      ...(estadoFiltro ? { estado: estadoFiltro } : {}),
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
          boletos: true,
          ordenes: true,
        },
      },
    },
  });

  return (
    <AdminLayout>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Rifas</h2>
            <p className="text-sm text-slate-500 mt-1">Administra tus sorteos, boletos y ordenes.</p>
          </div>
          <Link
            href="/admin/rifas/nueva"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-bold text-white transition-colors hover:bg-brand-500"
          >
            + Nueva Rifa
          </Link>
        </div>

        <form className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_150px] lg:grid-cols-[1fr_180px_auto]">
          <input
            name="q"
            defaultValue={query}
            className="min-h-11 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Buscar titulo, categoria o descripcion"
          />
          <select
            name="estado"
            defaultValue={estadoFiltro}
            className="min-h-11 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Todas</option>
            <option value="ACTIVA">Activa</option>
            <option value="PAUSADA">Pausada</option>
            <option value="FINALIZADA">Finalizada</option>
            <option value="CANCELADA">Eliminada</option>
          </select>
          <button className="min-h-11 rounded-lg bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-500 sm:col-span-2 lg:col-span-1">
            Filtrar
          </button>
        </form>

        <div className="space-y-3 lg:hidden">
          {rifas.map((rifa) => {
            const progress = progressPercent(rifa._count.boletos, rifa.cantidadBoletos);

            return (
              <article
                key={rifa.id}
                className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {rifa.titulo}
                    </h3>
                    <p className="mt-1 truncate text-xs text-slate-500">{rifa.categoria}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${statusClass(rifa.estado)}`}>
                    {statusLabel(rifa.estado)}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wide text-slate-400">Boletos</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {rifa._count.boletos}/{rifa.cantidadBoletos}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-gold-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Ordenes</dt>
                    <dd className="mt-1 font-bold text-slate-700 dark:text-slate-200">{rifa._count.ordenes}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Precio</dt>
                    <dd className="mt-1 font-bold text-slate-700 dark:text-slate-200">
                      {currencyFormatter.format(rifa.precioBoleto)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Sorteo</dt>
                    <dd className="mt-1 font-bold text-slate-700 dark:text-slate-200">
                      {new Date(rifa.fechaSorteo).toLocaleDateString('es-MX')}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 grid gap-2">
                  <Link
                    href={`/admin/rifas/${rifa.id}`}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-900 px-3 text-sm font-bold text-gold-200 dark:bg-brand-700"
                  >
                    Gestionar
                  </Link>
                  <RifaQuickActions rifaId={rifa.id} estadoActual={rifa.estado} />
                </div>
              </article>
            );
          })}
          {rifas.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-500">No hay rifas creadas aun.</div>
          )}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Titulo</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Estado</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Boletos</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Ordenes</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Precio</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Sorteo</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rifas.map((rifa) => (
                <tr
                  key={rifa.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{rifa.titulo}</div>
                    <div className="text-xs text-slate-500">{rifa.categoria}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(rifa.estado)}`}
                    >
                      {statusLabel(rifa.estado)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {rifa._count.boletos}/{rifa.cantidadBoletos}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{rifa._count.ordenes}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {currencyFormatter.format(rifa.precioBoleto)}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {new Date(rifa.fechaSorteo).toLocaleDateString('es-MX')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/rifas/${rifa.id}`}
                        className="text-brand-600 hover:text-brand-800 font-medium text-sm"
                      >
                        Gestionar
                      </Link>
                      <RifaQuickActions rifaId={rifa.id} estadoActual={rifa.estado} />
                    </div>
                  </td>
                </tr>
              ))}
              {rifas.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No hay rifas creadas aun.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
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
