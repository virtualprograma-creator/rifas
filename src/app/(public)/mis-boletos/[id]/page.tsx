import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ComprobanteUploadForm } from '@/components/ComprobanteUploadForm';
import { PaymentMethods } from '@/components/PaymentMethods';
import { OrderCountdown } from '@/components/OrderCountdown';
import { TicketDownloader } from '@/components/TicketDownloader';
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

  const boletos = orden.boletos.map((boleto) => boleto.numeroFormateado);
  const folio = displayFolio(orden);
  const estadoPago =
    orden.estado === 'PAGADA'
      ? 'Pagado'
      : orden.estado === 'EN_REVISION'
        ? 'Pendiente de validacion'
        : 'Pendiente';
  const estadoBoleto =
    orden.estado === 'PENDIENTE'
      ? 'Apartado'
      : orden.estado === 'EN_REVISION'
        ? 'En revision'
        : orden.estado === 'PAGADA'
          ? 'Pagada'
          : orden.estado;
  const whatsappUrl = generateWhatsAppMessage({
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
    <main className="min-h-screen bg-[#eef8f2] px-4 py-10 dark:bg-[#071710]">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl bg-white p-6 text-center shadow-xl dark:bg-[#0b2419]">
          <div className="border-y-2 border-dashed border-teal-400/60 py-6">
            <h1 className="text-xl font-extrabold uppercase text-slate-900 dark:text-gold-100">
              {orden.cliente.nombre}
            </h1>
            <p className="mt-2 text-lg font-bold text-slate-800 dark:text-white">{boletos.join(', ')}</p>
            <span className="mt-3 inline-flex rounded-md bg-blue-600 px-5 py-2 text-sm font-extrabold uppercase text-white">
              {estadoBoleto}
            </span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Folio: {folio}
            </p>
          </div>

          <div className="mt-5 grid gap-3 text-left text-sm">
            <Info label="Rifa" value={orden.rifa.titulo} />
            <Info label="Total" value={currencyFormatter.format(orden.total)} />
            <Info label="Estado de pago" value={estadoPago} />
            <Info
              label="Vence"
              value={orden.expiresAt ? new Date(orden.expiresAt).toLocaleString('es-MX') : 'Sin vencimiento'}
            />
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <div className="text-xs font-bold uppercase text-slate-500">Tiempo restante</div>
              <div className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                <OrderCountdown expiresAt={orden.expiresAt?.toISOString() || null} />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <PaymentMethods ordenId={orden.id} selectedMetodoPagoId={orden.metodoPagoId} metodos={orden.rifa.metodosPago} />
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex min-h-12 items-center justify-center rounded-lg bg-[#079b89] px-5 font-extrabold uppercase text-white transition hover:bg-[#087f72]"
          >
            Enviar a WhatsApp
          </a>

          <TicketDownloader orden={{
            ...orden,
            folio: folio,
            boletos: orden.boletos.map(b => ({ numeroFormateado: b.numeroFormateado }))
          }} />

          <div className="mt-4">
            <ComprobanteUploadForm ordenId={orden.id} comprobanteUrl={orden.comprobanteUrl} />
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="font-semibold text-brand-700 hover:text-brand-600 dark:text-gold-100">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
      <div className="text-xs font-bold uppercase text-slate-500">{label}</div>
      <div className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
