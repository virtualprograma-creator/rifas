import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { displayFolio } from '@/lib/folio';
import { generateAdminComprobanteMessage } from '@/lib/whatsapp';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

type Props = {
  params: Promise<{ id: string }>;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

export async function POST(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const orden = await prisma.orden.findUnique({
      where: { id },
      include: {
        cliente: true,
        rifa: true,
        boletos: { orderBy: { numero: 'asc' } },
      },
    });

    if (!orden) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    if (!['PENDIENTE', 'EN_REVISION', 'PAGADA'].includes(orden.estado)) {
      return NextResponse.json({ error: 'Esta orden ya no acepta comprobantes' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('comprobante');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Selecciona un archivo válido' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'El comprobante no debe pesar más de 5 MB' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Solo se aceptan imágenes JPG, PNG, WEBP o PDF' }, { status: 400 });
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const fileName = `${id}-${randomUUID()}.${extension}`;
    const bytes = await file.arrayBuffer();
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'comprobantes');
    const uploadPath = path.join(uploadDir, fileName);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(uploadPath, Buffer.from(bytes));

    const comprobanteUrl = `/uploads/comprobantes/${fileName}`;
    await prisma.$transaction(async (tx) => {
      await tx.orden.update({
        where: { id },
        data: {
          estado: 'EN_REVISION',
          comprobanteUrl,
          notasPago: 'Comprobante enviado por el cliente. Pendiente de validación.',
        },
      });

      await tx.boleto.updateMany({
        where: { ordenId: id },
        data: {
          estado: 'APARTADO',
          pagadoAt: null,
        },
      });
    });

    const origin = request.headers.get('origin') || '';
    const adminWhatsappUrl = await generateAdminComprobanteMessage({
      folio: displayFolio(orden),
      cliente: orden.cliente.nombre,
      rifaTitulo: orden.rifa.titulo,
      boletos: orden.boletos.map((boleto) => boleto.numeroFormateado),
      total: orden.total,
      ordenUrl: `${origin}/admin/ordenes/${orden.id}`,
    });

    await logAudit({
      actorType: 'CLIENTE',
      action: 'UPLOAD_RECEIPT',
      entityType: 'ORDEN',
      entityId: id,
      summary: `${orden.cliente.nombre} subió comprobante para la orden ${displayFolio(orden)}`,
      metadata: {
        folio: displayFolio(orden),
        comprobanteUrl,
        boletos: orden.boletos.map((boleto) => boleto.numeroFormateado),
      },
    });

    return NextResponse.json({ success: true, comprobanteUrl, adminWhatsappUrl });
  } catch (error) {
    console.error('Error subiendo comprobante:', error);
    return NextResponse.json({ error: 'Error interno al subir el comprobante' }, { status: 500 });
  }
}
