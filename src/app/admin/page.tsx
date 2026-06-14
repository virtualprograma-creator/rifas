import Link from 'next/link';
import type { ReactNode } from 'react';
import { prisma } from '@/lib/prisma';
import { AdminLayout } from '@/components/AdminLayout';
import { liberarOrdenesVencidas } from '@/lib/orders';

export const revalidate = 0;

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
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
        <section className="premium-card rounded-xl bg-white p-4 shadow-sm dark:bg-[#101923] sm:p-5">
          <div className="relative z-10 mb-4">
            <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">Accesos rápidos</h2>
            <p className="mt-1 text-sm text-slate-500">Enlaces a las secciones clave del panel.</p>
          </div>
          <div className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <QuickActionCard href="/admin/rifas" title="Rifas" description="Ver y crear rifas" color="blue" icon={<TicketIcon />} />
            <QuickActionCard href="/admin/comprobantes" title="Comprobantes" description="Validar pagos" color="emerald" icon={<ShieldIcon />} />
            <QuickActionCard href="/admin/clientes" title="Clientes" description="Base de datos" color="indigo" icon={<UsersIcon />} />
            <QuickActionCard href="/admin/configuracion" title="Configuración" description="Ajustes generales" color="amber" icon={<SettingsIcon />} />
          </div>
        </section>

        <section className="premium-card rounded-xl bg-white p-4 shadow-sm dark:bg-[#101923] sm:p-5">
          <div className="relative z-10 mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">Resumen</h2>
              <p className="mt-1 text-sm text-slate-500">Vista general de rifas, órdenes y boletos.</p>
            </div>
            <Link href="/admin/rifas/nueva" className="hidden rounded-lg bg-brand-500 px-3 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-lg active:scale-[0.98] sm:inline-flex">
              Nueva rifa
            </Link>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Rifas activas" value={`${rifasActivas}/${totalRifas}`} tone="green" />
            <StatCard label="Órdenes" value={totalOrdenes.toString()} tone="amber" />
            <StatCard label="Clientes" value={totalClientes.toString()} tone="teal" />
            <StatCard label="Ingresos" value={currencyFormatter.format(ingresos._sum.total || 0)} tone="green" />
            <StatCard label="Pagados" value={boletosPagados.toString()} tone="rose" />
            <StatCard label="Apartados" value={boletosApartados.toString()} tone="yellow" />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Panel title="Órdenes por estado">
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
              {ordenesPorEstado.length === 0 && <EmptyState text="Todavía no hay órdenes." />}
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
          title="Órdenes recientes"
          action={
            <Link href="/admin/ordenes" className="text-sm font-bold text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-300">
              Ver todas
            </Link>
          }
        >
          <div className="space-y-3 md:hidden">
            {ordenesRecientes.map((orden) => (
              <article key={orden.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
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

                <Link href={`/admin/ordenes/${orden.id}`} className="mt-3 inline-flex min-h-9 w-full items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-bold text-white transition-all active:scale-[0.98] dark:bg-brand-600">
                  Gestionar
                </Link>
              </article>
            ))}
            {ordenesRecientes.length === 0 && <EmptyState text="Todavía no hay órdenes registradas." />}
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
                  <tr key={orden.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-white/5">
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
                      Todavía no hay órdenes registradas.
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
    <section className="premium-card rounded-xl bg-white p-4 shadow-sm dark:bg-[#101923] sm:p-5">
      <div className="relative z-10 mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">{title}</h2>
        {action}
      </div>
      <div className="relative z-10">{children}</div>
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
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
        <div className="progress-premium h-full rounded-full" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function QuickActionCard({
  href,
  title,
  description,
  color,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  color: 'blue' | 'emerald' | 'indigo' | 'amber';
  icon: ReactNode;
}) {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:bg-blue-500/5 dark:text-blue-400 dark:hover:bg-blue-500/10 border-blue-500/10 dark:border-blue-500/5',
    emerald: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400 dark:hover:bg-emerald-500/10 border-emerald-500/10 dark:border-emerald-500/5',
    indigo: 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 dark:bg-indigo-500/5 dark:text-indigo-400 dark:hover:bg-indigo-500/10 border-indigo-500/10 dark:border-indigo-500/5',
    amber: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400 dark:hover:bg-amber-500/10 border-amber-500/10 dark:border-amber-500/5',
  };

  return (
    <Link
      href={href}
      className={`group flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] sm:p-4 ${colorMap[color]}`}
    >
      <div className="mb-2 rounded-xl bg-white p-2 shadow-sm transition-transform duration-200 group-hover:scale-110 dark:bg-slate-900/60">
        {icon}
      </div>
      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 sm:text-sm">{title}</span>
      <span className="mt-0.5 hidden text-[10px] text-slate-500 dark:text-slate-400 sm:block">{description}</span>
    </Link>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: 'green' | 'amber' | 'teal' | 'rose' | 'yellow' }) {
  const toneMap: Record<typeof tone, { text: string; dot: string }> = {
    green: { text: 'text-brand-600 dark:text-brand-400', dot: 'bg-brand-500 shadow-brand-500/30' },
    amber: { text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-400 shadow-amber-400/30' },
    teal: { text: 'text-teal-600 dark:text-teal-400', dot: 'bg-teal-400 shadow-teal-400/30' },
    rose: { text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-400 shadow-rose-400/30' },
    yellow: { text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-400 shadow-yellow-400/30' },
  };
  const toneClass = toneMap[tone];

  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-white/70 p-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/30 dark:hover:bg-slate-900/50 sm:p-3">
      <div className="mb-1 flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full shadow-lg ${toneClass.dot}`} aria-hidden="true" />
        <div className="truncate text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 sm:text-[11px]">{label}</div>
      </div>
      <div className={`truncate text-sm font-black leading-none ${toneClass.text} sm:text-2xl`}>{value}</div>
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

function TicketIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.6-4A12 12 0 0112 3 12 12 0 013.4 6 12 12 0 003 9c0 5.6 3.8 10.3 9 11.6 5.2-1.3 9-6 9-11.6 0-1-.1-2-.4-3z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.4-1.9M17 20H7m10 0v-2c0-.7-.1-1.3-.4-1.9M7 20H2v-2a3 3 0 015.4-1.9M7 20v-2c0-.7.1-1.3.4-1.9m0 0a5 5 0 019.2 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.3 4.3c.4-1.7 2.9-1.7 3.4 0a1.7 1.7 0 002.5 1c1.5-.9 3.3.8 2.4 2.4a1.7 1.7 0 001 2.5c1.7.4 1.7 2.9 0 3.4a1.7 1.7 0 00-1 2.5c.9 1.5-.8 3.3-2.4 2.4a1.7 1.7 0 00-2.5 1c-.4 1.7-2.9 1.7-3.4 0a1.7 1.7 0 00-2.5-1c-1.5.9-3.3-.8-2.4-2.4a1.7 1.7 0 00-1-2.5c-1.7-.4-1.7-2.9 0-3.4a1.7 1.7 0 001-2.5c-.9-1.5.8-3.3 2.4-2.4a1.7 1.7 0 002.5-1z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
