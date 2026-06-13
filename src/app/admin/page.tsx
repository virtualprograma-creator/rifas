import Link from 'next/link';
import type { ReactNode } from 'react';
import { prisma } from '@/lib/prisma';
import { AdminLayout } from '@/components/AdminLayout';
import { liberarOrdenesVencidas } from '@/lib/orders';

export const revalidate = 0;

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

export default async function AdminDashboard() {
  await liberarOrdenesVencidas();

  const [
    totalRifas,
    totalOrdenes,
    totalClientes,
    rifasActivas,
    boletosPagados,
    boletosApartados,
    ingresos,
    ordenesRecientes,
    ordenesPorEstado,
    rifasResumen,
  ] = await Promise.all([
    prisma.rifa.count(),
    prisma.orden.count(),
    prisma.cliente.count(),
    prisma.rifa.count({ where: { estado: 'ACTIVA' } }),
    prisma.boleto.count({ where: { estado: 'PAGADO' } }),
    prisma.boleto.count({ where: { estado: 'APARTADO' } }),
    prisma.orden.aggregate({
      where: { estado: 'PAGADA' },
      _sum: { total: true },
    }),
    prisma.orden.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        cliente: true,
        rifa: true,
        boletos: true,
      },
    }),
    prisma.orden.groupBy({
      by: ['estado'],
      _count: { estado: true },
      _sum: { total: true },
    }),
    prisma.rifa.findMany({
      where: { estado: 'ACTIVA' },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            boletos: { where: { estado: { in: ['APARTADO', 'PAGADO'] } } },
          },
        },
      },
    }),
  ]);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#101923] sm:p-5">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">Resumen</h2>
              <p className="mt-1 text-sm text-slate-500">Vista general de rifas, ordenes y boletos.</p>
            </div>
            <Link href="/admin/rifas/nueva" className="hidden rounded-lg bg-brand-500 px-3 py-2 text-sm font-bold text-white hover:bg-brand-600 sm:inline-flex">
              Nueva rifa
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Rifas activas" value={`${rifasActivas}/${totalRifas}`} tone="green" />
            <StatCard label="Ordenes" value={totalOrdenes.toString()} tone="amber" />
            <StatCard label="Clientes" value={totalClientes.toString()} tone="teal" />
            <StatCard label="Ingresos" value={currencyFormatter.format(ingresos._sum.total || 0)} tone="green" />
            <StatCard label="Pagados" value={boletosPagados.toString()} tone="rose" />
            <StatCard label="Apartados" value={boletosApartados.toString()} tone="yellow" />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Panel title="Ordenes por estado">
            <div className="space-y-4">
              {ordenesPorEstado.map((item) => (
                <Bar
                  key={item.estado}
                  label={item.estado}
                  value={item._count.estado}
                  max={Math.max(totalOrdenes, 1)}
                  detail={currencyFormatter.format(item._sum.total || 0)}
                />
              ))}
              {ordenesPorEstado.length === 0 && <EmptyState text="Todavia no hay ordenes." />}
            </div>
          </Panel>

          <Panel title="Ventas por rifa">
            <div className="space-y-4">
              {rifasResumen.map((rifa) => (
                <Bar
                  key={rifa.id}
                  label={rifa.titulo}
                  value={rifa._count.boletos}
                  max={Math.max(rifa.cantidadBoletos, 1)}
                  detail={`${rifa._count.boletos}/${rifa.cantidadBoletos}`}
                />
              ))}
              {rifasResumen.length === 0 && <EmptyState text="No hay rifas activas." />}
            </div>
          </Panel>
        </div>

        <Panel
          title="Ordenes recientes"
          action={
            <Link href="/admin/ordenes" className="text-sm font-bold text-brand-600 hover:text-brand-500 dark:text-brand-300">
              Ver todas
            </Link>
          }
        >
          <div className="space-y-3 md:hidden">
            {ordenesRecientes.map((orden) => (
              <article key={orden.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-950 dark:text-white">{orden.cliente.nombre}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{orden.rifa.titulo}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${statusClass(orden.estado)}`}>
                    {orden.estado}
                  </span>
                </div>

                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Boletos</dt>
                    <dd className="mt-1 font-bold text-slate-700 dark:text-slate-200">{orden.boletos.length}</dd>
                  </div>
                  <div className="col-span-2 text-right">
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Total</dt>
                    <dd className="mt-1 font-bold text-slate-700 dark:text-slate-200">{currencyFormatter.format(orden.total)}</dd>
                  </div>
                </dl>

                <Link href={`/admin/ordenes/${orden.id}`} className="mt-3 inline-flex min-h-9 w-full items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-bold text-white dark:bg-brand-600">
                  Gestionar
                </Link>
              </article>
            ))}
            {ordenesRecientes.length === 0 && <EmptyState text="Todavia no hay ordenes registradas." />}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <TableHead>Cliente</TableHead>
                  <TableHead>Rifa</TableHead>
                  <TableHead>Boletos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </tr>
              </thead>
              <tbody>
                {ordenesRecientes.map((orden) => (
                  <tr key={orden.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                    <TableCell strong>{orden.cliente.nombre}</TableCell>
                    <TableCell>{orden.rifa.titulo}</TableCell>
                    <TableCell>{orden.boletos.length}</TableCell>
                    <TableCell>{currencyFormatter.format(orden.total)}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(orden.estado)}`}>{orden.estado}</span>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/ordenes/${orden.id}`} className="text-sm font-bold text-brand-600 dark:text-brand-300">
                        Gestionar
                      </Link>
                    </TableCell>
                  </tr>
                ))}
                {ordenesRecientes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                      Todavia no hay ordenes registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AdminLayout>
  );
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#101923] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Bar({ label, value, max, detail }: { label: string; value: number; max: number; detail: string }) {
  const width = Math.min(100, Math.round((value / max) * 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="truncate font-bold text-slate-700 dark:text-slate-200">{label}</span>
        <span className="shrink-0 text-slate-500">{detail}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: 'green' | 'amber' | 'teal' | 'rose' | 'yellow' }) {
  const toneMap: Record<typeof tone, { text: string; dot: string }> = {
    green: { text: 'text-brand-600 dark:text-brand-300', dot: 'bg-brand-500' },
    amber: { text: 'text-amber-600 dark:text-amber-300', dot: 'bg-amber-400' },
    teal: { text: 'text-teal-600 dark:text-teal-300', dot: 'bg-teal-400' },
    rose: { text: 'text-rose-600 dark:text-rose-300', dot: 'bg-rose-400' },
    yellow: { text: 'text-yellow-600 dark:text-yellow-300', dot: 'bg-yellow-400' },
  };
  const toneClass = toneMap[tone];

  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/35">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${toneClass.dot}`} aria-hidden="true" />
        <div className="truncate text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
      </div>
      <div className={`break-words text-2xl font-extrabold leading-none ${toneClass.text}`}>{value}</div>
    </div>
  );
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
      return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
  }
}

function TableHead({ children }: { children: ReactNode }) {
  return <th className="px-3 py-3 text-sm font-bold text-slate-500">{children}</th>;
}

function TableCell({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return (
    <td className={`px-3 py-3 text-sm ${strong ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
      {children}
    </td>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-800">{text}</div>;
}
