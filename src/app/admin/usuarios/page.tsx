import { AdminLayout } from '@/components/AdminLayout';
import { AdminUserForm } from '@/components/AdminUserForm';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export default async function AdminUsuariosPage() {
  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Administradores</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Nombre</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Correo</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Rol</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-500">Creado</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{admin.nombre}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{admin.email}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{admin.rol}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {new Date(admin.createdAt).toLocaleDateString('es-MX')}
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No hay administradores en base de datos. Puedes entrar con las credenciales del archivo .env.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <AdminUserForm />
      </div>
    </AdminLayout>
  );
}
