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
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Rifas</h2>
            <p className="text-sm text-slate-500 mt-1">Administra tus sorteos, boletos y ordenes.</p>
          </div>
          <Link
            href="/admin/rifas/nueva"
            className="inline-flex items-center justify-center bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            + Nueva Rifa
          </Link>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 mb-6">
          <input
            name="q"
            defaultValue={query}
            className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Buscar titulo, categoria o descripcion"
          />
          <select
            name="estado"
            defaultValue={estadoFiltro}
            className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Todas</option>
            <option value="ACTIVA">Activa</option>
            <option value="PAUSADA">Pausada</option>
            <option value="FINALIZADA">Finalizada</option>
          </select>
          <button className="rounded-xl bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-500">
            Filtrar
          </button>
        </form>

        <div className="overflow-x-auto">
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
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        rifa.estado === 'ACTIVA'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rifa.estado}
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
