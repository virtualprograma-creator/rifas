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

        <form className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 mb-6">
          <input
            name="q"
            defaultValue={query}
            className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Buscar nombre, telefono, correo o ciudad"
          />
          <button className="rounded-xl bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-500">
            Buscar
          </button>
        </form>

        <div className="overflow-x-auto">
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
      </div>
    </AdminLayout>
  );
}
