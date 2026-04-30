import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getErrorMessage, requireAdmin } from '@/lib/admin';
import { logAdminAction } from '@/lib/audit';

type Props = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Props) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const { estado, razonEstado } = await req.json();

    if (!estado || !['ACTIVA', 'PAUSADA', 'FINALIZADA', 'CANCELADA'].includes(estado)) {
      return NextResponse.json({ error: 'Estado invalido' }, { status: 400 });
    }

    const rifa = await prisma.rifa.update({
      where: { id },
      data: { 
        estado,
        razonEstado: razonEstado?.trim() || null
      },
    });

    await logAdminAction({
      action: 'UPDATE_STATUS',
      entityType: 'RIFA',
      entityId: id,
      summary: `Cambio de estado a ${estado} para la rifa: ${rifa.titulo}`,
      metadata: { estado, razonEstado },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
