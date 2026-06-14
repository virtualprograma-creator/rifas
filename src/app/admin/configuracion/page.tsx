import { AdminLayout } from '@/components/AdminLayout';
import { prisma } from '@/lib/prisma';
import { SettingsForm } from '@/components/SettingsForm';

export const revalidate = 0;

export default async function AdminConfiguracionPage() {
  const setting = await prisma.setting.findUnique({
    where: { key: 'whatsapp_number' },
  });
  
  const defaultNumber = process.env.WHATSAPP_NUMBER || '7441351057';
  const currentWhatsAppNumber = setting?.value || defaultNumber;

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101923] p-6 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Configuración del Sistema</h2>
          <p className="mt-1 text-sm text-slate-500">Administra los parámetros generales del sitio y canales de comunicación.</p>
        </div>
        <SettingsForm initialWhatsAppNumber={currentWhatsAppNumber} />
      </div>
    </AdminLayout>
  );
}
