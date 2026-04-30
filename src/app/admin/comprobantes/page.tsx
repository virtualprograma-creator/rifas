import Link from 'next/link';
import { AdminComprobanteActions } from '@/components/AdminComprobanteActions';
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
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Comprobantes recibidos</h2>
        <p className="mt-1 text-sm text-slate-500">Aprueba o rechaza comprobantes pendientes de validacion.</p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-sm font-semibold text-slate-500">Folio</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-500">Cliente</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-500">Rifa</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-500">Boletos</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-500">Total</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-500">Comprobante</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">{displayFolio(orden)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 dark:text-slate-100">{orden.cliente.nombre}</div>
                    <div className="text-xs text-slate-500">{orden.cliente.telefono}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{orden.rifa.titulo}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {orden.boletos.map((boleto) => boleto.numeroFormateado).join(', ')}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {currencyFormatter.format(orden.total)}
                  </td>
                  <td className="px-4 py-3">
                    <a href={orden.comprobanteUrl || '#'} target="_blank" rel="noreferrer" className="font-semibold text-brand-600 hover:text-brand-500">
                      Abrir
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <AdminComprobanteActions ordenId={orden.id} />
                    <Link href={`/admin/ordenes/${orden.id}`} className="mt-2 block text-sm font-semibold text-brand-600 hover:text-brand-500">
                      Ver orden
                    </Link>
                  </td>
                </tr>
              ))}
              {ordenes.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No hay comprobantes pendientes.
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
