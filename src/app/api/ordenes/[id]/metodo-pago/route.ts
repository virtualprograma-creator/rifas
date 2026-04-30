import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { displayFolio } from '@/lib/folio';

type Props = {
  params: Promise<{ id: string }>;
};

type Body = {
  metodoPagoId?: string;
};

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params;
  const body = (await request.json()) as Body;

  if (!body.metodoPagoId) {
    return NextResponse.json({ error: 'Metodo de pago requerido' }, { status: 400 });
  }

  const orden = await prisma.orden.findUnique({
    where: { id },
    select: { id: true, folio: true, rifaId: true },
  });

  if (!orden) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
  }

  const metodo = await prisma.metodoPago.findFirst({
    where: {
      id: body.metodoPagoId,
      rifaId: orden.rifaId,
    },
    select: { id: true },
  });

  if (!metodo) {
    return NextResponse.json({ error: 'Metodo de pago invalido' }, { status: 400 });
  }

  await prisma.orden.update({
    where: { id },
    data: { metodoPagoId: metodo.id },
  });

  await logAudit({
    actorType: 'CLIENTE',
    action: 'SELECT_PAYMENT_METHOD',
    entityType: 'ORDEN',
    entityId: id,
    summary: `Selecciono metodo de pago para la orden ${displayFolio(orden)}`,
    metadata: { metodoPagoId: metodo.id },
  });

  return NextResponse.json({ success: true });
}
