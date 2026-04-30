import Link from 'next/link';
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Rifas activas" value={`${rifasActivas}/${totalRifas}`} colorClass="text-brand-600" />
        <StatCard label="Ordenes" value={totalOrdenes.toString()} colorClass="text-amber-500" />
        <StatCard label="Clientes" value={totalClientes.toString()} colorClass="text-green-500" />
        <StatCard
          label="Ingresos pagados"
          value={currencyFormatter.format(ingresos._sum.total || 0)}
          colorClass="text-green-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard label="Boletos pagados" value={boletosPagados.toString()} colorClass="text-red-500" />
        <StatCard label="Boletos apartados" value={boletosApartados.toString()} colorClass="text-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5">Ordenes por estado</h2>
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
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5">Ventas por rifa</h2>
          <div className="space-y-4">
            {rifasResumen.map((rifa) => (
              <Bar
                key={rifa.id}
                label={rifa.titulo}
                value={rifa._count.boletos}
                max={Math.max(rifa.cantidadBoletos, 1)}
                detail={`${rifa._count.boletos}/${rifa.cantidadBoletos} boletos`}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Ordenes recientes</h2>
          <Link href="/admin/ordenes" className="text-sm font-semibold text-brand-600 hover:text-brand-500">
            Ver todas
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Cliente</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Rifa</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Boletos</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Total</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Estado</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenesRecientes.map((orden) => (
                <tr key={orden.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {orden.cliente.nombre}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{orden.rifa.titulo}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{orden.boletos.length}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {currencyFormatter.format(orden.total)}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{orden.estado}</td>
                  <td className="py-3 px-4">
                    <Link href={`/admin/ordenes/${orden.id}`} className="text-sm font-medium text-brand-600">
                      Gestionar
                    </Link>
                  </td>
                </tr>
              ))}
              {ordenesRecientes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Todavia no hay ordenes registradas.
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

function Bar({ label, value, max, detail }: { label: string; value: number; max: number; detail: string }) {
  const width = Math.min(100, Math.round((value / max) * 100));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-500">{detail}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${width}%` }} />
      </div>
    </div>
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
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center">
      <div className="text-slate-500 mb-2 font-medium">{label}</div>
      <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}
