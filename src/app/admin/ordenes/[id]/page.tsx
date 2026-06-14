import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminLayout } from '@/components/AdminLayout';
import { AdminOrderActions } from '@/components/AdminOrderActions';
import { OrderTicketsEditor } from '@/components/OrderTicketsEditor';
import { TicketDownloader } from '@/components/TicketDownloader';
import { AdminComprobanteViewer } from '@/components/AdminComprobanteViewer';
import { prisma } from '@/lib/prisma';
import { displayFolio } from '@/lib/folio';

export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

export default async function AdminOrdenDetallePage({ params }: Props) {
  const { id } = await params;

  const orden = await prisma.orden.findUnique({
    where: { id },
    include: {
      cliente: true,
      rifa: true,
      metodoPago: true,
      boletos: {
        orderBy: { numero: 'asc' },
      },
    },
  });

  if (!orden) {
    notFound();
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <Link href="/admin/ordenes" className="text-sm font-medium text-brand-600 hover:text-brand-500">
            Volver a órdenes
          </Link>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Orden {displayFolio(orden)}</h2>
              <p className="text-sm text-slate-500 mt-1">
                Creada el {new Date(orden.createdAt).toLocaleString('es-MX')}
              </p>
              <div className="mt-3">
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
            <span className="w-fit rounded px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700">
              {orden.estado}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Datos de la orden</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <Info label="Cliente" value={orden.cliente.nombre} />
                <Info label="Teléfono" value={orden.cliente.telefono} />
                <Info label="Correo" value={orden.cliente.correo || 'Sin correo'} />
                <Info label="Ubicación" value={`${orden.cliente.ciudad}, ${orden.cliente.estado}`} />
                <Info label="Rifa" value={orden.rifa.titulo} />
                <Info label="Total" value={currencyFormatter.format(orden.total)} />
                <Info label="Banco elegido" value={orden.metodoPago?.banco || 'Sin seleccionar'} />
                <Info
                  label="Vence"
                  value={orden.expiresAt ? new Date(orden.expiresAt).toLocaleString('es-MX') : 'Sin vencimiento'}
                />
                <Info
                  label="Pagada"
                  value={orden.pagadoAt ? new Date(orden.pagadoAt).toLocaleString('es-MX') : 'No pagada'}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Boletos</h3>
              <OrderTicketsEditor ordenId={orden.id} boletos={orden.boletos} />
            </section>

            <section className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Comprobante</h3>
              <AdminComprobanteViewer
                comprobanteUrl={orden.comprobanteUrl}
                notasPago={orden.notasPago}
              />
            </section>
          </div>

          <AdminOrderActions
            ordenId={orden.id}
            estado={orden.estado}
            comprobanteUrl={orden.comprobanteUrl}
            notasPago={orden.notasPago}
          />
        </div>
      </div>
    </AdminLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4">
      <div className="text-xs uppercase text-slate-500 mb-1">{label}</div>
      <div className="font-semibold text-slate-800 dark:text-slate-100">{value}</div>
    </div>
  );
}
