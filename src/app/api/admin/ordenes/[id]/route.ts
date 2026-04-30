import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getErrorMessage, requireAdmin } from '@/lib/admin';
import { logAdminAction } from '@/lib/audit';
import { displayFolio } from '@/lib/folio';

type Props = {
  params: Promise<{ id: string }>;
};

type UpdateOrdenBody = {
  estado?: string;
  comprobanteUrl?: string;
  notasPago?: string;
};

const ESTADOS_VALIDOS = new Set(['PENDIENTE', 'EN_REVISION', 'PAGADA', 'RECHAZADA', 'CANCELADA']);

export async function PATCH(req: Request, { params }: Props) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const body = (await req.json()) as UpdateOrdenBody;
    const estado = body.estado?.trim().toUpperCase();

    if (!estado || !ESTADOS_VALIDOS.has(estado)) {
      return NextResponse.json({ error: 'Estado de orden invalido' }, { status: 400 });
    }

    const orden = await prisma.orden.findUnique({
      where: { id },
      include: { boletos: true },
    });

    if (!orden) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const previousEstado = orden.estado;

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.orden.update({
        where: { id },
        data: {
          estado,
          comprobanteUrl: body.comprobanteUrl === undefined ? orden.comprobanteUrl : body.comprobanteUrl.trim() || null,
          notasPago: body.notasPago === undefined ? orden.notasPago : body.notasPago.trim() || null,
          pagadoAt: estado === 'PAGADA' ? now : null,
          canceladoAt: estado === 'CANCELADA' || estado === 'RECHAZADA' ? now : null,
        },
      });

      if (estado === 'PAGADA') {
        await tx.boleto.updateMany({
          where: { ordenId: id },
          data: {
            estado: 'PAGADO',
            pagadoAt: now,
          },
        });
      }

      if (estado === 'PENDIENTE' || estado === 'EN_REVISION' || estado === 'RECHAZADA') {
        await tx.boleto.updateMany({
          where: { ordenId: id },
          data: {
            estado: 'APARTADO',
            pagadoAt: null,
          },
        });
      }

      if (estado === 'CANCELADA') {
        await tx.boleto.updateMany({
          where: { ordenId: id },
          data: {
            estado: 'DISPONIBLE',
            clienteId: null,
            ordenId: null,
            apartadoAt: null,
            pagadoAt: null,
          },
        });
      }
    });

    await logAdminAction({
      action: 'UPDATE_ORDER',
      entityType: 'ORDEN',
      entityId: id,
      summary: `Cambio la orden ${displayFolio(orden)} de ${previousEstado} a ${estado}`,
      metadata: {
        previousEstado,
        nextEstado: estado,
        boletos: orden.boletos.map((boleto) => boleto.numeroFormateado),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
