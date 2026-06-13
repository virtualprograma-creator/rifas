import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminLayout } from '@/components/AdminLayout';
import { RifaEditForm } from '@/components/RifaEditForm';
import { WinnerButton } from '@/components/WinnerButton';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

export default async function AdminRifaDetailPage({ params }: Props) {
  const { id } = await params;

  const rifa = await prisma.rifa.findUnique({
    where: { id },
    include: {
      boletos: {
        select: { estado: true },
      },
      ordenes: {
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          cliente: true,
          boletos: true,
        },
      },
      metodosPago: {
        orderBy: { orden: 'asc' },
      },
    },
  });

  if (!rifa) {
    notFound();
  }

  const boletosPorEstado = rifa.boletos.reduce<Record<string, number>>((acc, boleto) => {
    acc[boleto.estado] = (acc[boleto.estado] || 0) + 1;
    return acc;
  }, {});

  const disponibles = boletosPorEstado.DISPONIBLE || 0;
  const apartados = boletosPorEstado.APARTADO || 0;
  const pagados = boletosPorEstado.PAGADO || 0;
  const vendidos = rifa.cantidadBoletos - disponibles;
  const avance = rifa.cantidadBoletos > 0 ? Math.round((vendidos / rifa.cantidadBoletos) * 100) : 0;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <Link href="/admin/rifas" className="text-sm font-medium text-brand-600 hover:text-brand-500">
                Volver a rifas
              </Link>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <h2 className="min-w-0 text-2xl font-bold leading-tight text-slate-800 dark:text-slate-100">
                  {rifa.titulo}
                </h2>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(rifa.estado)}`}>
                  {rifa.estado}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Sorteo: {new Date(rifa.fechaSorteo).toLocaleDateString('es-MX')} | Precio:{' '}
                {currencyFormatter.format(rifa.precioBoleto)}
              </p>
            </div>
            <Link
              href={`/rifas/${rifa.id.slice(-10).toUpperCase()}`}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Ver pagina publica
            </Link>
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_1.15fr]">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-200">Ganador</div>
                {rifa.ganadorBoleto ? (
                  <p className="mt-1 text-sm text-slate-500">
                    Boleto {rifa.ganadorBoleto} - {rifa.ganadorCliente || 'Sin cliente'}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">Aun no se ha elegido ganador.</p>
                )}
                </div>
              </div>
              <WinnerButton rifaId={rifa.id} />
            </div>

            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-bold text-slate-700 dark:text-slate-200">Avance</span>
                <span className="font-extrabold text-brand-600 dark:text-brand-300">{avance}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-950">
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${avance}%` }} />
              </div>
              <div className="mt-2 text-xs text-slate-500">{vendidos} boletos no disponibles</div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatCard label="Total" value={rifa.cantidadBoletos} colorClass="text-brand-500" />
                <StatCard label="Disponibles" value={disponibles} colorClass="text-green-400" />
                <StatCard label="Apartados" value={apartados} colorClass="text-amber-400" />
                <StatCard label="Pagados" value={pagados} colorClass="text-red-400" />
              </div>
            </div>
          </div>
        </div>

        <RifaEditForm key={rifa.updatedAt.getTime()} rifa={rifa} />

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100">Ordenes recientes</h3>

          <div className="space-y-3 lg:hidden">
            {rifa.ordenes.map((orden) => (
              <article
                key={orden.id}
                className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                      {orden.cliente.nombre}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">{orden.cliente.telefono}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${orderStatusClass(orden.estado)}`}>
                    {orden.estado}
                  </span>
                </div>

                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-[11px] font-bold uppercase text-slate-400">Boletos</dt>
                    <dd className="mt-1 font-bold text-slate-700 dark:text-slate-200">{orden.boletos.length}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase text-slate-400">Total</dt>
                    <dd className="mt-1 font-bold text-slate-700 dark:text-slate-200">
                      {currencyFormatter.format(orden.total)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase text-slate-400">Fecha</dt>
                    <dd className="mt-1 font-bold text-slate-700 dark:text-slate-200">
                      {new Date(orden.createdAt).toLocaleDateString('es-MX')}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/admin/ordenes/${orden.id}`}
                  className="mt-3 inline-flex min-h-9 w-full items-center justify-center rounded-lg bg-brand-900 px-3 text-sm font-bold text-gold-200 dark:bg-brand-700"
                >
                  Ver orden
                </Link>
              </article>
            ))}
            {rifa.ordenes.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-500">Esta rifa todavia no tiene ordenes.</div>
            )}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Cliente</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Telefono</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Boletos</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Total</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Estado</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Fecha</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rifa.ordenes.map((orden) => (
                  <tr key={orden.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {orden.cliente.nombre}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{orden.cliente.telefono}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{orden.boletos.length}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {currencyFormatter.format(orden.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${orderStatusClass(orden.estado)}`}>
                        {orden.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {new Date(orden.createdAt).toLocaleDateString('es-MX')}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/ordenes/${orden.id}`}
                        className="text-brand-600 hover:text-brand-500 font-medium text-sm"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
                {rifa.ordenes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Esta rifa todavia no tiene ordenes.
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
  value: number;
  colorClass: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
      <div className="truncate text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-2 text-2xl font-extrabold leading-none ${colorClass}`}>{value}</div>
    </div>
  );
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

function orderStatusClass(status: string) {
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
