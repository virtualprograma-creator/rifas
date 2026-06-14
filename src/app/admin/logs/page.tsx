import type { ReactNode } from 'react';
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
  DELETE_RIFA: 'Elimino rifa',
  UPDATE_STATUS: 'Cambio estado',
  SELECT_WINNER: 'Selecciono ganador',
  UPDATE_ORDER: 'Cambio orden',
  REMOVE_ORDER_TICKETS: 'Quito boletos',
  EXPIRE_ORDERS: 'Libero vencidas',
  CREATE_ORDER: 'Apartado cliente',
  SELECT_PAYMENT_METHOD: 'Selecciono banco',
  UPLOAD_RECEIPT: 'Subio comprobante',
  UPDATE_SETTING: 'Actualizo config',
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
      <div className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#101923] sm:p-5">
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">Log de actividad</h2>
            <p className="mt-1 text-sm text-slate-500">
              Registro de cambios, apartados, comprobantes, accesos y acciones administrativas.
            </p>
          </div>

          <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_150px_210px_150px_auto]">
            <input
              name="q"
              defaultValue={query}
              className="min-h-11 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950/50 dark:text-white sm:col-span-2 xl:col-span-1"
              placeholder="Buscar admin, accion, resumen, folio o ID"
            />
            <select
              name="actor"
              title="Filtrar por actor"
              defaultValue={actorFilter}
              className="min-h-11 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950/50 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="ADMIN">Admin</option>
              <option value="CLIENTE">Cliente</option>
              <option value="SYSTEM">Sistema</option>
            </select>
            <select
              name="action"
              title="Filtrar por tipo de acción"
              defaultValue={actionFilter}
              className="min-h-11 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950/50 dark:text-white"
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
              title="Filtrar por tipo de entidad"
              defaultValue={entityFilter}
              className="min-h-11 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950/50 dark:text-white"
            >
              <option value="">Todo</option>
              <option value="ADMIN">Admin</option>
              <option value="RIFA">Rifa</option>
              <option value="ORDEN">Orden</option>
            </select>
            <button className="min-h-11 rounded-lg bg-brand-500 px-5 text-sm font-bold text-white hover:bg-brand-600 sm:col-span-2 xl:col-span-1">
              Filtrar
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#101923] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">Registros</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-slate-900">
              {logs.length}
            </span>
          </div>

          <div className="space-y-2 lg:hidden">
            {logs.map((log) => (
              <article
                key={log.id}
                className="rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 p-2.5 hover:border-slate-200 dark:hover:border-slate-700 transition-colors shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`inline-block rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${actorClass(log.actorType)}`}>
                      {log.actorType}
                    </span>
                    <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                      {log.adminNombre || 'Cliente'}
                    </span>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    {new Date(log.createdAt).toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="mt-1.5 flex items-start gap-2">
                  <span className="shrink-0 rounded bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 dark:text-slate-300">
                    {actionLabels[log.action] || log.action}
                  </span>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium flex-1 wrap-break-word">
                    {log.summary}
                  </p>
                </div>
              </article>
            ))}
            {logs.length === 0 && <EmptyState />}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Accion</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Resumen</TableHead>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                    <TableCell>{new Date(log.createdAt).toLocaleString('es-MX')}</TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{log.adminNombre || log.actorType}</div>
                      {log.adminEmail && <div className="text-xs text-slate-500">{log.adminEmail}</div>}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {actionLabels[log.action] || log.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${entityClass(log.entityType)}`}>
                        {log.entityType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="block max-w-44 break-all text-xs text-slate-500">{log.entityId || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="block max-w-xl text-sm text-slate-700 dark:text-slate-200">{log.summary}</span>
                    </TableCell>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState />
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

function actorClass(actor: string) {
  switch (actor) {
    case 'ADMIN':
      return 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300';
    case 'CLIENTE':
      return 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300';
    case 'SYSTEM':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
  }
}

function entityClass(entity: string) {
  switch (entity) {
    case 'ORDEN':
      return 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300';
    case 'RIFA':
      return 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300';
    case 'ADMIN':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
  }
}

function TableHead({ children }: { children: ReactNode }) {
  return <th className="px-3 py-3 text-sm font-bold text-slate-500">{children}</th>;
}

function TableCell({ children }: { children: ReactNode }) {
  return <td className="px-3 py-3 align-top text-sm text-slate-600 dark:text-slate-300">{children}</td>;
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-800">
      No hay registros con esos filtros.
    </div>
  );
}
