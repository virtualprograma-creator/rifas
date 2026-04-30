import Link from 'next/link';
import { AdminLayout } from '@/components/AdminLayout';
import { ExpireOrdersButton } from '@/components/ExpireOrdersButton';
import { TicketDownloader } from '@/components/TicketDownloader';
import { prisma } from '@/lib/prisma';
import { liberarOrdenesVencidas } from '@/lib/orders';
import { displayFolio } from '@/lib/folio';

export const revalidate = 0;

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

type Props = {
  searchParams: Promise<{
    q?: string;
    estado?: string;
  }>;
};

export default async function AdminOrdenesPage({ searchParams }: Props) {
  await liberarOrdenesVencidas();
  const { q = '', estado = '' } = await searchParams;
  const query = q.trim();
  const estadoFiltro = estado.trim().toUpperCase();
  const queryUpper = query.toUpperCase();

  const ordenes = await prisma.orden.findMany({
    where: {
      ...(estadoFiltro ? { estado: estadoFiltro } : {}),
      ...(query
        ? {
            OR: [
              { cliente: { nombre: { contains: query } } },
              { cliente: { telefono: { contains: query } } },
              { rifa: { titulo: { contains: query } } },
              { folio: { contains: queryUpper } },
              { estado: { contains: queryUpper } },
              { boletos: { some: { numeroFormateado: { contains: query } } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      cliente: true,
      rifa: true,
      boletos: {
        orderBy: { numero: 'asc' },
      },
    },
  });

  const totalIngresos = ordenes.reduce((sum, orden) => sum + orden.total, 0);
  const pendientes = ordenes.filter((orden) => orden.estado === 'PENDIENTE').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Total ordenes" value={ordenes.length.toString()} colorClass="text-brand-600" />
          <StatCard label="Pendientes" value={pendientes.toString()} colorClass="text-amber-500" />
          <StatCard label="Importe total" value={currencyFormatter.format(totalIngresos)} colorClass="text-green-500" />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ordenes</h2>
              <p className="text-sm text-slate-500 mt-1">Consulta las apartadas registradas por los clientes.</p>
            </div>
            <ExpireOrdersButton />
          </div>

          <form className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 mb-6">
            <input
              name="q"
              defaultValue={query}
              className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Buscar cliente, telefono, rifa o boleto"
            />
            <select
              name="estado"
              defaultValue={estadoFiltro}
              className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_REVISION">Pendiente de validacion</option>
              <option value="PAGADA">Pagada</option>
              <option value="RECHAZADA">Rechazada</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="VENCIDA">Vencida</option>
            </select>
            <button className="rounded-xl bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-500">
              Filtrar
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Cliente</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Folio</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Rifa</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Boletos</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Total</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Estado</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Fecha</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((orden) => (
                  <tr
                    key={orden.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{orden.cliente.nombre}</div>
                      <div className="text-xs text-slate-500">{orden.cliente.telefono}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-200">{displayFolio(orden)}</td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/rifas/${orden.rifa.id}`}
                        className="font-medium text-brand-600 hover:text-brand-500"
                      >
                        {orden.rifa.titulo}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {orden.boletos.map((boleto) => boleto.numeroFormateado).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {currencyFormatter.format(orden.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          orden.estado === 'PENDIENTE' || orden.estado === 'EN_REVISION'
                            ? 'bg-amber-100 text-amber-700'
                            : orden.estado === 'PAGADA'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {orden.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {new Date(orden.createdAt).toLocaleDateString('es-MX')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/ordenes/${orden.id}`}
                          className="text-brand-600 hover:text-brand-500 font-medium text-sm"
                        >
                          Ver
                        </Link>
                        <TicketDownloader 
                          variant="admin"
                          orden={{
                            ...orden,
                            folio: displayFolio(orden),
                            boletos: orden.boletos.map(b => ({ numeroFormateado: b.numeroFormateado }))
                          }} 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {ordenes.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      Todavia no hay ordenes registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="text-slate-500 mb-2 font-medium">{label}</div>
      <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}
