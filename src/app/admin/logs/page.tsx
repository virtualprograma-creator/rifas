import { AdminLayout } from '@/components/AdminLayout';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

type Props = {
  searchParams: Promise<{
    q?: string;
    actor?: string;
    action?: string;
    entity?: string;
  }>;
};

const actionLabels: Record<string, string> = {
  LOGIN: 'Inicio de sesion',
  LOGOUT: 'Cierre de sesion',
  CREATE_ADMIN: 'Creo admin',
  CREATE_RIFA: 'Creo rifa',
  UPDATE_RIFA: 'Edito rifa',
  SELECT_WINNER: 'Selecciono ganador',
  UPDATE_ORDER: 'Cambio orden',
  REMOVE_ORDER_TICKETS: 'Quito boletos',
  EXPIRE_ORDERS: 'Libero vencidas',
  CREATE_ORDER: 'Apartado cliente',
  SELECT_PAYMENT_METHOD: 'Selecciono banco',
  UPLOAD_RECEIPT: 'Subio comprobante',
};

export default async function AdminLogsPage({ searchParams }: Props) {
  const { q = '', actor = '', action = '', entity = '' } = await searchParams;
  const query = q.trim();
  const actorFilter = actor.trim().toUpperCase();
  const actionFilter = action.trim().toUpperCase();
  const entityFilter = entity.trim().toUpperCase();

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(actorFilter ? { actorType: actorFilter } : {}),
      ...(actionFilter ? { action: actionFilter } : {}),
      ...(entityFilter ? { entityType: entityFilter } : {}),
      ...(query
        ? {
            OR: [
              { adminNombre: { contains: query } },
              { adminEmail: { contains: query } },
              { action: { contains: query.toUpperCase() } },
              { entityType: { contains: query.toUpperCase() } },
              { entityId: { contains: query } },
              { summary: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 250,
  });

  const actions = await prisma.auditLog.findMany({
    distinct: ['action'],
    orderBy: { action: 'asc' },
    select: { action: true },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Log de actividad</h2>
          <p className="mt-1 text-sm text-slate-500">
            Registro de cambios, eliminaciones, apartados, comprobantes, accesos y acciones administrativas.
          </p>

          <form className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_160px_220px_160px_auto]">
            <input
              name="q"
              defaultValue={query}
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              placeholder="Buscar admin, accion, resumen, folio o ID"
            />
            <select
              name="actor"
              defaultValue={actorFilter}
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="ADMIN">Admin</option>
              <option value="CLIENTE">Cliente</option>
              <option value="SYSTEM">Sistema</option>
            </select>
            <select
              name="action"
              defaultValue={actionFilter}
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            >
              <option value="">Todas las acciones</option>
              {actions.map((item) => (
                <option key={item.action} value={item.action}>
                  {actionLabels[item.action] || item.action}
                </option>
              ))}
            </select>
            <select
              name="entity"
              defaultValue={entityFilter}
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            >
              <option value="">Todo</option>
              <option value="ADMIN">Admin</option>
              <option value="RIFA">Rifa</option>
              <option value="ORDEN">Orden</option>
            </select>
            <button className="rounded-xl bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-500">
              Filtrar
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-sm font-semibold text-slate-500">Fecha</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-500">Actor</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-500">Accion</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-500">Entidad</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-500">Registro</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-500">Resumen</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {new Date(log.createdAt).toLocaleString('es-MX')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {log.adminNombre || log.actorType}
                      </div>
                      {log.adminEmail && <div className="text-xs text-slate-500">{log.adminEmail}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{log.entityType}</td>
                    <td className="max-w-44 break-all px-4 py-3 text-xs text-slate-500">{log.entityId || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{log.summary}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No hay registros con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
