import Link from 'next/link';
import { AdminComprobanteActions } from '@/components/AdminComprobanteActions';
import { AdminComprobanteViewer } from '@/components/AdminComprobanteViewer';
import { AdminLayout } from '@/components/AdminLayout';
import { prisma } from '@/lib/prisma';
import { displayFolio } from '@/lib/folio';

export const revalidate = 0;

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

export default async function AdminComprobantesPage() {
  const ordenes = await prisma.orden.findMany({
    where: {
      comprobanteUrl: { not: null },
      estado: 'EN_REVISION',
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      cliente: true,
      rifa: true,
      boletos: { orderBy: { numero: 'asc' } },
    },
  });

  return (
    <AdminLayout>
      <section className="premium-card rounded-2xl bg-white p-5 shadow-sm dark:bg-[#101923] sm:p-6">
        <div className="relative z-10 mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Comprobantes recibidos</h2>
            <p className="mt-1 text-sm text-slate-500">Aprueba o rechaza comprobantes pendientes de validación.</p>
          </div>
          <span className="inline-flex w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            {ordenes.length} pendientes
          </span>
        </div>

        <div className="relative z-10 space-y-3 md:hidden">
          {ordenes.map((orden) => (
            <article key={orden.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/30">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Folio</p>
                  <h3 className="font-black text-slate-900 dark:text-white">{displayFolio(orden)}</h3>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                  En revisión
                </span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p><strong>Cliente:</strong> {orden.cliente.nombre}</p>
                <p><strong>Rifa:</strong> {orden.rifa.titulo}</p>
                <p><strong>Boletos:</strong> {orden.boletos.map((boleto) => boleto.numeroFormateado).join(', ')}</p>
                <p><strong>Total:</strong> {currencyFormatter.format(orden.total)}</p>
              </div>
              <div className="mt-4">
                <AdminComprobanteViewer comprobanteUrl={orden.comprobanteUrl} notasPago={orden.notasPago} />
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <AdminComprobanteActions ordenId={orden.id} />
                <Link href={`/admin/ordenes/${orden.id}`} className="text-sm font-bold text-brand-600 hover:text-brand-500">
                  Ver orden completa
                </Link>
              </div>
            </article>
          ))}
          {ordenes.length === 0 && <EmptyState />}
        </div>

        <div className="relative z-10 hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <TableHead>Folio</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Rifa</TableHead>
                <TableHead>Boletos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Comprobante</TableHead>
                <TableHead>Acciones</TableHead>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.id} className="border-b border-slate-100 align-top transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-white/5">
                  <td className="px-4 py-4 font-black text-slate-800 dark:text-slate-100">{displayFolio(orden)}</td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-800 dark:text-slate-100">{orden.cliente.nombre}</div>
                    <div className="text-xs text-slate-500">{orden.cliente.telefono}</div>
                  </td>
                  <td className="max-w-56 px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{orden.rifa.titulo}</td>
                  <td className="max-w-48 px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {orden.boletos.map((boleto) => boleto.numeroFormateado).join(', ')}
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-200">{currencyFormatter.format(orden.total)}</td>
                  <td className="px-4 py-4">
                    <AdminComprobanteViewer comprobanteUrl={orden.comprobanteUrl} notasPago={orden.notasPago} />
                  </td>
                  <td className="px-4 py-4">
                    <AdminComprobanteActions ordenId={orden.id} />
                    <Link href={`/admin/ordenes/${orden.id}`} className="mt-2 block text-sm font-bold text-brand-600 hover:text-brand-500">
                      Ver orden
                    </Link>
                  </td>
                </tr>
              ))}
              {ordenes.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-sm font-bold text-slate-500">{children}</th>;
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500 dark:border-slate-800">
      No hay comprobantes pendientes.
    </div>
  );
}
