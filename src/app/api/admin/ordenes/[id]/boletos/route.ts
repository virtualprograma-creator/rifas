import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getErrorMessage, requireAdmin } from '@/lib/admin';
import { logAdminAction } from '@/lib/audit';
import { displayFolio } from '@/lib/folio';

type Props = {
  params: Promise<{ id: string }>;
};

type RemoveBoletosBody = {
  boletoIds?: string[];
};

export async function POST(req: Request, { params }: Props) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const body = (await req.json()) as RemoveBoletosBody;
    const boletoIds = [...new Set(body.boletoIds || [])];

    if (boletoIds.length === 0) {
      return NextResponse.json({ error: 'Selecciona al menos un boleto' }, { status: 400 });
    }

    const orden = await prisma.orden.findUnique({
      where: { id },
      include: {
        rifa: true,
        boletos: true,
      },
    });

    if (!orden) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const boletosDeOrden = new Set(orden.boletos.map((boleto) => boleto.id));
    const todosPertenecen = boletoIds.every((boletoId) => boletosDeOrden.has(boletoId));

    if (!todosPertenecen) {
      return NextResponse.json({ error: 'Uno o mas boletos no pertenecen a esta orden' }, { status: 400 });
    }

    const restantes = orden.boletos.length - boletoIds.length;
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.boleto.updateMany({
        where: {
          id: { in: boletoIds },
          ordenId: id,
        },
        data: {
          estado: 'DISPONIBLE',
          clienteId: null,
          ordenId: null,
          apartadoAt: null,
          pagadoAt: null,
        },
      });

      await tx.orden.update({
        where: { id },
        data: {
          total: restantes * orden.rifa.precioBoleto,
          estado: restantes === 0 ? 'CANCELADA' : orden.estado,
          pagadoAt: restantes === 0 ? null : orden.pagadoAt,
          canceladoAt: restantes === 0 ? now : orden.canceladoAt,
        },
      });
    });

    const removidos = orden.boletos
      .filter((boleto) => boletoIds.includes(boleto.id))
      .map((boleto) => boleto.numeroFormateado);

    await logAdminAction({
      action: 'REMOVE_ORDER_TICKETS',
      entityType: 'ORDEN',
      entityId: id,
      summary: `Quito ${boletoIds.length} boleto(s) de la orden ${displayFolio(orden)}`,
      metadata: {
        boletos: removidos,
        restantes,
      },
    });

    return NextResponse.json({ success: true, removidos: boletoIds.length, restantes });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
