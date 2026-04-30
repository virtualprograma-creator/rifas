import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getErrorMessage, requireAdmin } from '@/lib/admin';
import { logAdminAction } from '@/lib/audit';

type Props = {
  params: Promise<{ id: string }>;
};

type UpdateRifaBody = {
  titulo?: string;
  categoria?: string;
  descripcionCorta?: string;
  descripcionCompleta?: string;
  imagenUrl?: string;
  precioBoleto?: string | number;
  fechaSorteo?: string;
  estado?: string;
  metodosPago?: {
    banco?: string;
    logoUrl?: string;
    titular?: string;
    numeroTarjeta?: string;
    clabe?: string;
  }[];
};

const ESTADOS_RIFA = new Set(['ACTIVA', 'PAUSADA', 'FINALIZADA']);

export async function PATCH(req: Request, { params }: Props) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const body = (await req.json()) as UpdateRifaBody;

    if (!body.titulo || !body.precioBoleto || !body.fechaSorteo || !body.estado) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const estado = body.estado.trim().toUpperCase();
    const precioBoleto = Number(body.precioBoleto);

    if (!ESTADOS_RIFA.has(estado)) {
      return NextResponse.json({ error: 'Estado de rifa invalido' }, { status: 400 });
    }

    if (!Number.isFinite(precioBoleto) || precioBoleto <= 0) {
      return NextResponse.json({ error: 'Precio invalido' }, { status: 400 });
    }

    const metodosPago = (body.metodosPago || [])
      .map((metodo, index) => ({
        banco: metodo.banco?.trim() || '',
        logoUrl: metodo.logoUrl?.trim() || null,
        titular: metodo.titular?.trim() || '',
        numeroTarjeta: metodo.numeroTarjeta?.replace(/\s/g, '') || null,
        clabe: metodo.clabe?.replace(/\s/g, '') || null,
        orden: index,
      }))
      .filter((metodo) => metodo.banco && metodo.titular && (metodo.numeroTarjeta || metodo.clabe));

    await prisma.$transaction(async (tx) => {
      await tx.rifa.update({
        where: { id },
        data: {
          titulo: body.titulo!.trim(),
          categoria: body.categoria?.trim() || 'General',
          descripcionCorta: body.descripcionCorta?.trim() || '',
          descripcionCompleta: body.descripcionCompleta?.trim() || '',
          imagenUrl: body.imagenUrl?.trim() || '',
          precioBoleto,
          fechaSorteo: new Date(body.fechaSorteo!),
          estado,
        },
      });

      await tx.metodoPago.deleteMany({ where: { rifaId: id } });
      if (metodosPago.length > 0) {
        await tx.metodoPago.createMany({
          data: metodosPago.map((metodo) => ({ ...metodo, rifaId: id })),
        });
      }
    });

    await logAdminAction({
      action: 'UPDATE_RIFA',
      entityType: 'RIFA',
      entityId: id,
      summary: `Actualizo la rifa ${body.titulo}`,
      metadata: {
        estado,
        precioBoleto,
        metodosPago: metodosPago.length,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    
    const rifa = await prisma.rifa.findUnique({
      where: { id },
      select: { titulo: true }
    });

    if (!rifa) {
      return NextResponse.json({ error: 'Rifa no encontrada' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Borrado manual de relaciones para asegurar "borrado total"
      await tx.boleto.deleteMany({ where: { rifaId: id } });
      await tx.orden.deleteMany({ where: { rifaId: id } });
      await tx.metodoPago.deleteMany({ where: { rifaId: id } });
      await tx.rifa.delete({ where: { id } });
    });

    await logAdminAction({
      action: 'DELETE_RIFA',
      entityType: 'RIFA',
      entityId: id,
      summary: `ELIMINACIÓN TOTAL de la rifa: ${rifa.titulo}`,
      metadata: {
        id,
        titulo: rifa.titulo,
        info: 'Se borraron todos los boletos y ordenes asociados.',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
