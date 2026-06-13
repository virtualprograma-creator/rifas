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
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Ordenes" value={ordenes.length.toString()} colorClass="text-brand-500" />
          <StatCard label="Pendientes" value={pendientes.toString()} colorClass="text-amber-400" />
          <StatCard label="Importe" value={currencyFormatter.format(totalIngresos)} colorClass="text-green-400" />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Ordenes</h2>
              <p className="text-sm text-slate-500 mt-1">Consulta las apartadas registradas por los clientes.</p>
            </div>
            <ExpireOrdersButton />
          </div>

          <form className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px] lg:grid-cols-[1fr_180px_auto]">
            <input
              name="q"
              defaultValue={query}
              className="min-h-11 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Buscar cliente, telefono, rifa o boleto"
            />
            <select
              name="estado"
              defaultValue={estadoFiltro}
              className="min-h-11 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_REVISION">Pendiente de validacion</option>
              <option value="PAGADA">Pagada</option>
              <option value="RECHAZADA">Rechazada</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="VENCIDA">Vencida</option>
            </select>
            <button className="min-h-11 rounded-lg bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-500 sm:col-span-2 lg:col-span-1">
              Filtrar
            </button>
          </form>

          <div className="space-y-3 lg:hidden">
            {ordenes.map((orden) => (
              <article
                key={orden.id}
                className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Folio</p>
                    <h3 className="mt-1 truncate text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      {displayFolio(orden)}
                    </h3>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${statusClass(orden.estado)}`}>
                    {orden.estado}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                      {orden.cliente.nombre}
                    </p>
                    <p className="text-xs text-slate-500">{orden.cliente.telefono}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Total</p>
                    <p className="mt-1 text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      {currencyFormatter.format(orden.total)}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/admin/rifas/${orden.rifa.id}`}
                  className="mt-3 block truncate text-sm font-bold text-brand-600 hover:text-brand-500"
                >
                  {orden.rifa.titulo}
                </Link>

                <div className="mt-3 rounded-md bg-white p-2 dark:bg-slate-800">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Boletos ({orden.boletos.length})
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                    {formatTickets(orden.boletos.map((boleto) => boleto.numeroFormateado))}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    href={`/admin/ordenes/${orden.id}`}
                    className="inline-flex min-h-9 items-center justify-center rounded-lg bg-brand-900 px-3 text-sm font-bold text-gold-200 dark:bg-brand-700"
                  >
                    Ver
                  </Link>
                  <div className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-800">
                    <TicketDownloader 
                      variant="admin"
                      orden={{
                        ...orden,
                        folio: displayFolio(orden),
                        boletos: orden.boletos.map(b => ({ numeroFormateado: b.numeroFormateado }))
                      }} 
                    />
                  </div>
                </div>
              </article>
            ))}
            {ordenes.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-500">Todavia no hay ordenes registradas.</div>
            )}
          </div>

          <div className="hidden overflow-x-auto lg:block">
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
                    <td className="max-w-48 py-3 px-4 text-slate-600 dark:text-slate-400">
                      <span className="line-clamp-2">
                        {formatTickets(orden.boletos.map((boleto) => boleto.numeroFormateado))}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {currencyFormatter.format(orden.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${statusClass(orden.estado)}`}
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
    <div className="min-w-0 rounded-lg border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="truncate text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-2 break-words text-xl font-extrabold leading-none sm:text-2xl ${colorClass}`}>{value}</div>
    </div>
  );
}

function formatTickets(tickets: string[]) {
  return tickets.length > 0 ? tickets.join(', ') : 'Sin boletos';
}

function statusClass(status: string) {
  switch (status) {
    case 'PAGADA':
      return 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300';
    case 'EN_REVISION':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
    case 'PENDIENTE':
      return 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300';
    case 'VENCIDA':
    case 'CANCELADA':
    case 'RECHAZADA':
      return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
  }
}
