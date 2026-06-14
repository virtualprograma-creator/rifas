import { AdminLayout } from '@/components/AdminLayout';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminClientesPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  const query = q.trim();

  const clientes = await prisma.cliente.findMany({
    where: query
      ? {
          OR: [
            { nombre: { contains: query } },
            { telefono: { contains: query } },
            { correo: { contains: query } },
            { ciudad: { contains: query } },
            { estado: { contains: query } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      ordenes: true,
      boletos: true,
    },
  });

  return (
    <AdminLayout>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Clientes</h2>
          <p className="text-sm text-slate-500 mt-1">Personas que han apartado boletos en tus rifas.</p>
        </div>

        <form className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            name="q"
            defaultValue={query}
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            placeholder="Buscar nombre, teléfono, correo o ciudad"
          />
          <button className="rounded-xl bg-brand-600 px-6 py-2.5 font-bold text-white hover:bg-brand-500 transition-colors shadow-sm active:scale-[0.99] text-sm">
            Buscar
          </button>
        </form>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Nombre</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Contacto</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Ubicacion</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Ordenes</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Boletos</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Total gastado</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-500">Registro</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => {
                const totalGastado = cliente.ordenes.reduce((sum, orden) => sum + orden.total, 0);

                return (
                  <tr
                    key={cliente.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{cliente.nombre}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-600 dark:text-slate-400">{cliente.telefono}</div>
                      {cliente.correo && <div className="text-xs text-slate-500">{cliente.correo}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {cliente.ciudad}, {cliente.estado}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{cliente.ordenes.length}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{cliente.boletos.length}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {currencyFormatter.format(totalGastado)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {new Date(cliente.createdAt).toLocaleDateString('es-MX')}
                    </td>
                  </tr>
                );
              })}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Todavia no hay clientes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {clientes.map((cliente) => {
            const totalGastado = cliente.ordenes.reduce((sum, orden) => sum + orden.total, 0);

            return (
              <div
                key={cliente.id}
                className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-4 space-y-3 shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {cliente.nombre}
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Registrado el {new Date(cliente.createdAt).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-bold text-brand-600 dark:text-brand-400">
                    {currencyFormatter.format(totalGastado)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div>
                    <div className="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide text-[10px]">Contacto</div>
                    <div className="mt-1 text-slate-700 dark:text-slate-300 font-medium wrap-break-word">
                      <div>{cliente.telefono}</div>
                      {cliente.correo && (
                        <div className="text-slate-500 text-[11px] font-normal mt-0.5">{cliente.correo}</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide text-[10px]">Ubicación</div>
                    <div className="mt-1 text-slate-700 dark:text-slate-300 font-medium">
                      {cliente.ciudad}, {cliente.estado}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide text-[10px]">Órdenes</div>
                    <div className="mt-1 font-bold text-slate-800 dark:text-slate-200">
                      {cliente.ordenes.length}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide text-[10px]">Boletos</div>
                    <div className="mt-1 font-bold text-slate-800 dark:text-slate-200">
                      {cliente.boletos.length}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {clientes.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-500">
              Todavía no hay clientes registrados.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
