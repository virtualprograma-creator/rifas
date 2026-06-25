import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { ComprobanteUploadForm } from '@/components/ComprobanteUploadForm';
import { PaymentMethods } from '@/components/PaymentMethods';
import { OrderCountdown } from '@/components/OrderCountdown';
import { TicketDownloader } from '@/components/TicketDownloader';
import { OrderLockScreen } from '@/components/OrderLockScreen';
import { prisma } from '@/lib/prisma';
import { generateWhatsAppMessage } from '@/lib/whatsapp';
import { displayFolio } from '@/lib/folio';

export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

export default async function MisBoletosPage({ params }: Props) {
  const { id } = await params;
  const orden = await prisma.orden.findUnique({
    where: { id },
    include: {
      cliente: true,
      rifa: {
        include: {
          metodosPago: {
            orderBy: { orden: 'asc' },
          },
        },
      },
      boletos: {
        orderBy: { numero: 'asc' },
      },
      metodoPago: true,
    },
  });

  if (!orden) {
    notFound();
  }

  const cookieStore = await cookies();
  const isVerified = cookieStore.get(`order_verified_${id}`)?.value === 'true';

  if (!isVerified) {
    const verifyPhone = async (phone: string) => {
      'use server';
      const normalizedInput = phone.replace(/\D/g, '');
      const normalizedDb = orden.cliente.telefono.replace(/\D/g, '');

      if (normalizedInput.length >= 4 && (normalizedDb === normalizedInput || normalizedDb.endsWith(normalizedInput))) {
        const cStore = await cookies();
        cStore.set(`order_verified_${id}`, 'true', {
          path: '/',
          maxAge: 60 * 60 * 24 * 365,
          sameSite: 'lax',
        });
        return { success: true };
      }
      return { success: false, error: 'El número de teléfono no coincide.' };
    };

    return <OrderLockScreen onVerify={verifyPhone} />;
  }

  const boletos = orden.boletos.map((boleto) => boleto.numeroFormateado);
  const folio = displayFolio(orden);
  const estado = getOrderStatus(orden.estado);
  const whatsappUrl = await generateWhatsAppMessage({
    nombre: orden.cliente.nombre,
    telefono: orden.cliente.telefono,
    ciudad: orden.cliente.ciudad,
    estado: orden.cliente.estado,
    rifaTitulo: orden.rifa.titulo,
    boletos,
    total: orden.total,
    folio,
    banco: orden.metodoPago?.banco,
  });

  return (
    <main className="min-h-screen bg-[#eef8f2] px-4 py-8 dark:bg-[#071710] sm:py-10">
      <div className="mx-auto max-w-6xl">
        <section className="premium-card rounded-3xl bg-white p-5 shadow-xl dark:bg-[#0b2419] sm:p-7">
          {/* Header & Ticket numbers above the 2-column grid to look great and save mobile height */}
          <div className="mb-6 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-600 dark:text-gold-300 sm:text-xs">Tus boletos</p>
                <h1 className="mt-1 text-xl font-black text-slate-950 dark:text-white sm:text-3xl">
                  {orden.cliente.nombre}
                </h1>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider sm:px-3 sm:py-1 sm:text-xs ${estado.className}`}>
                {estado.label}
              </span>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-gold-400/60 bg-gold-50/40 p-4 text-center dark:bg-gold-900/10 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400 sm:text-xs">Números apartados</p>
              <p className="mt-2 text-lg font-black leading-relaxed text-brand-900 dark:text-gold-100 sm:mt-3 sm:text-2xl">
                {boletos.join(', ')}
              </p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 sm:mt-4 sm:text-xs">Folio: {folio}</p>
            </div>
          </div>

          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              {/* Detailed info grid, compact for mobile */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <div className="col-span-2">
                  <Info label="Rifa" value={orden.rifa.titulo} />
                </div>
                <div className="col-span-1">
                  <Info label="Total" value={currencyFormatter.format(orden.total)} strong />
                </div>
                <div className="col-span-1">
                  <Info label="Estado de pago" value={estado.paymentLabel} />
                </div>
                <div className="col-span-2">
                  <Info
                    label="Vence"
                    value={orden.expiresAt ? new Date(orden.expiresAt).toLocaleString('es-MX') : 'Sin vencimiento'}
                  />
                </div>
                <div className="col-span-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900/50 sm:p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">Tiempo restante</div>
                    <div className="mt-1 text-xs font-black text-slate-900 dark:text-slate-100 sm:text-base">
                      <OrderCountdown expiresAt={orden.expiresAt?.toISOString() || null} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons (WhatsApp / Download PDF) */}
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-12 items-center justify-center rounded-xl bg-[#079b89] px-2 py-2 text-center text-xs font-extrabold uppercase text-white shadow-lg shadow-teal-900/10 transition hover:bg-[#087f72] active:scale-[0.98] sm:px-5 sm:text-sm"
                >
                  <span className="leading-tight">WhatsApp</span>
                </a>

                <TicketDownloader
                  orden={{
                    ...orden,
                    folio,
                    boletos: orden.boletos.map((boleto) => ({ numeroFormateado: boleto.numeroFormateado })),
                  }}
                />
              </div>
            </div>

            <div className="space-y-5">
              <PaymentMethods ordenId={orden.id} selectedMetodoPagoId={orden.metodoPagoId} metodos={orden.rifa.metodosPago} />
              <ComprobanteUploadForm ordenId={orden.id} comprobanteUrl={orden.comprobanteUrl} />
            </div>
          </div>
        </section>

        <div className="mt-6 text-center">
          <Link href="/" className="font-semibold text-brand-700 hover:text-brand-600 dark:text-gold-100">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}

function getOrderStatus(status: string) {
  switch (status) {
    case 'PAGADA':
      return {
        label: 'Pagada',
        paymentLabel: 'Pago confirmado',
        className: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
      };
    case 'EN_REVISION':
      return {
        label: 'En revisión',
        paymentLabel: 'Pendiente de validación',
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
      };
    case 'VENCIDA':
      return {
        label: 'Vencida',
        paymentLabel: 'Tiempo agotado',
        className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
      };
    case 'CANCELADA':
      return {
        label: 'Cancelada',
        paymentLabel: 'Cancelada',
        className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
      };
    default:
      return {
        label: 'Apartada',
        paymentLabel: 'Pendiente de pago',
        className: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
      };
  }
}

function Info({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900/50 sm:p-4">
      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">{label}</div>
      <div className={`mt-1 text-slate-900 dark:text-slate-100 ${strong ? 'text-base font-black text-brand-700 dark:text-gold-300 sm:text-lg' : 'text-xs font-semibold sm:text-sm'}`}>
        {value}
      </div>
    </div>
  );
}
