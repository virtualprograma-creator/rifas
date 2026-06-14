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
  maximumFractionDigits: 0,
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

  const totalImporte = ordenes.reduce((sum, orden) => sum + orden.total, 0);
  const pendientes = ordenes.filter((orden) => orden.estado === 'PENDIENTE').length;
  const revision = ordenes.filter((orden) => orden.estado === 'EN_REVISION').length;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Órdenes" value={ordenes.length.toString()} tone="blue" />
          <StatCard label="Pendientes" value={pendientes.toString()} tone="amber" />
          <StatCard label="En revisión" value={revision.toString()} tone="yellow" />
          <StatCard label="Importe" value={currencyFormatter.format(totalImporte)} tone="green" />
        </div>

        <section className="premium-card rounded-2xl bg-white p-4 shadow-sm dark:bg-[#101923] sm:p-5">
          <div className="relative z-10 mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Órdenes</h2>
              <p className="mt-1 text-sm text-slate-500">Consulta apartados, pagos y comprobantes registrados por clientes.</p>
            </div>
            <ExpireOrdersButton />
          </div>

          <form className="relative z-10 mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px] lg:grid-cols-[1fr_190px_auto]">
            <input
              name="q"
              defaultValue={query}
              className="min-h-11 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              placeholder="Buscar cliente, teléfono, rifa, folio o boleto"
            />
            <select
              name="estado"
              title="Filtrar por estado"
              defaultValue={estadoFiltro}
              className="min-h-11 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_REVISION">Pendiente de validación</option>
              <option value="PAGADA">Pagada</option>
              <option value="RECHAZADA">Rechazada</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="VENCIDA">Vencida</option>
            </select>
            <button className="min-h-11 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-500 active:scale-[0.98] sm:col-span-2 lg:col-span-1">
              Filtrar
            </button>
          </form>

          <div className="relative z-10 space-y-3 lg:hidden">
            {ordenes.map((orden) => (
              <article key={orden.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Folio</p>
                    <h3 className="mt-1 truncate text-base font-black text-slate-900 dark:text-slate-100">
                      {displayFolio(orden)}
                    </h3>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${statusClass(orden.estado)}`}>
                    {statusLabel(orden.estado)}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{orden.cliente.nombre}</p>
                    <p className="text-xs text-slate-500">{orden.cliente.telefono}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Total</p>
                    <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">
                      {currencyFormatter.format(orden.total)}
                    </p>
                  </div>
                </div>

                <Link href={`/admin/rifas/${orden.rifa.id}`} className="mt-3 block truncate text-sm font-bold text-brand-600 hover:text-brand-500">
                  {orden.rifa.titulo}
                </Link>

                <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/40">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Boletos ({orden.boletos.length})</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                    {formatTickets(orden.boletos.map((boleto) => boleto.numeroFormateado))}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    href={`/admin/ordenes/${orden.id}`}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-700 px-3 text-sm font-bold text-white"
                  >
                    Ver orden
                  </Link>
                  <div className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-800">
                    <TicketDownloader
                      variant="admin"
                      orden={{
                        ...orden,
                        folio: displayFolio(orden),
                        boletos: orden.boletos.map((boleto) => ({ numeroFormateado: boleto.numeroFormateado })),
                      }}
                    />
                  </div>
                </div>
              </article>
            ))}
            {ordenes.length === 0 && <EmptyState text="Todavía no hay órdenes registradas." />}
          </div>

          <div className="relative z-10 hidden overflow-x-auto lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <TableHead>Cliente</TableHead>
                  <TableHead>Folio</TableHead>
                  <TableHead>Rifa</TableHead>
                  <TableHead>Boletos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((orden) => (
                  <tr key={orden.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{orden.cliente.nombre}</div>
                      <div className="text-xs text-slate-500">{orden.cliente.telefono}</div>
                    </td>
                    <td className="px-4 py-3 font-black text-slate-700 dark:text-slate-200">{displayFolio(orden)}</td>
                    <td className="max-w-56 px-4 py-3">
                      <Link href={`/admin/rifas/${orden.rifa.id}`} className="font-bold text-brand-600 hover:text-brand-500">
                        {orden.rifa.titulo}
                      </Link>
                    </td>
                    <td className="max-w-48 px-4 py-3 text-slate-600 dark:text-slate-400">
                      <span className="line-clamp-2">{formatTickets(orden.boletos.map((boleto) => boleto.numeroFormateado))}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">{currencyFormatter.format(orden.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(orden.estado)}`}>
                        {statusLabel(orden.estado)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {new Date(orden.createdAt).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/ordenes/${orden.id}`} className="text-sm font-bold text-brand-600 hover:text-brand-500">
                          Ver
                        </Link>
                        <TicketDownloader
                          variant="admin"
                          orden={{
                            ...orden,
                            folio: displayFolio(orden),
                            boletos: orden.boletos.map((boleto) => ({ numeroFormateado: boleto.numeroFormateado })),
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {ordenes.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState text="Todavía no hay órdenes registradas." />
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

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500 dark:border-slate-800">{text}</div>;
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

function statusLabel(status: string) {
  return status === 'EN_REVISION' ? 'EN REVISIÓN' : status;
}
