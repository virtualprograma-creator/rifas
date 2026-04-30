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
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link href="/admin/rifas" className="text-sm font-medium text-brand-600 hover:text-brand-500">
                Volver a rifas
              </Link>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{rifa.titulo}</h2>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    rifa.estado === 'ACTIVA' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                  }`}
                >
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

          <div className="mt-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ganador</div>
                {rifa.ganadorBoleto ? (
                  <p className="text-sm text-slate-500">
                    Boleto {rifa.ganadorBoleto} - {rifa.ganadorCliente || 'Sin cliente'}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">Aun no se ha elegido ganador.</p>
                )}
              </div>
              <WinnerButton rifaId={rifa.id} />
            </div>
          </div>

          <div className="mt-6">
            <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-brand-600" style={{ width: `${avance}%` }} />
            </div>
            <div className="mt-2 text-sm text-slate-500">{avance}% de boletos no disponibles</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Total boletos" value={rifa.cantidadBoletos} colorClass="text-brand-600" />
          <StatCard label="Disponibles" value={disponibles} colorClass="text-green-500" />
          <StatCard label="Apartados" value={apartados} colorClass="text-amber-500" />
          <StatCard label="Pagados" value={pagados} colorClass="text-red-500" />
        </div>

        <RifaEditForm key={rifa.updatedAt.getTime()} rifa={rifa} />

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Ordenes recientes</h3>
          <div className="overflow-x-auto">
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
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{orden.estado}</td>
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
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="text-slate-500 mb-2 font-medium">{label}</div>
      <div className={`text-4xl font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}
