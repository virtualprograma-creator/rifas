import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getErrorMessage, requireAdmin } from '@/lib/admin';
import { logAdminAction } from '@/lib/audit';

type Props = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, { params }: Props) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const { manualBoleto } = await req.json();

    let ganador;

    if (manualBoleto) {
      // Buscar el boleto manual
      const boleto = await prisma.boleto.findFirst({
        where: {
          rifaId: id,
          numeroFormateado: manualBoleto.trim(),
        },
        include: { cliente: true },
      });

      if (!boleto) {
        return NextResponse.json({ error: `El boleto #${manualBoleto} no existe en esta rifa` }, { status: 400 });
      }

      if (boleto.estado !== 'PAGADO') {
        return NextResponse.json({ error: `El boleto #${manualBoleto} no está PAGADO. No puede ser ganador.` }, { status: 400 });
      }

      ganador = boleto;
    } else {
      // Elección al azar
      const boletosPagados = await prisma.boleto.findMany({
        where: {
          rifaId: id,
          estado: 'PAGADO',
          cliente: { isNot: null },
        },
        include: { cliente: true },
      });

      if (boletosPagados.length === 0) {
        return NextResponse.json({ error: 'No hay boletos pagados para elegir ganador' }, { status: 400 });
      }

      ganador = boletosPagados[Math.floor(Math.random() * boletosPagados.length)];
    }

    await prisma.rifa.update({
      where: { id },
      data: {
        estado: 'FINALIZADA',
        ganadorBoleto: ganador.numeroFormateado,
        ganadorCliente: ganador.cliente?.nombre || 'Sin cliente',
        ganadorSeleccionadoAt: new Date(),
      },
    });

    await logAdminAction({
      action: 'SELECT_WINNER',
      entityType: 'RIFA',
      entityId: id,
      summary: `Selecciono ganador: boleto ${ganador.numeroFormateado} - ${ganador.cliente?.nombre || 'Sin cliente'}`,
      metadata: {
        boleto: ganador.numeroFormateado,
        cliente: ganador.cliente?.nombre || null,
      },
    });

    return NextResponse.json({
      success: true,
      ganador: {
        boleto: ganador.numeroFormateado,
        cliente: ganador.cliente?.nombre || 'Sin cliente',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
