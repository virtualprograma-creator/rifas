import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateWhatsAppMessage } from '@/lib/whatsapp';
import { getOrderExpirationDate } from '@/lib/orders';
import { createFolio } from '@/lib/folio';
import { logAudit } from '@/lib/audit';

type ApartarRequestBody = {
  rifaId?: string;
  boletos?: number[];
  cliente?: {
    nombre?: string;
    telefono?: string;
    ciudad?: string;
    estado?: string;
    correo?: string;
  };
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ApartarRequestBody;
    const { rifaId, boletos, cliente } = body;

    if (!rifaId || !boletos || !boletos.length || !cliente) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    if (!cliente.nombre || !cliente.telefono || !cliente.ciudad || !cliente.estado) {
      return NextResponse.json({ error: 'Faltan datos del cliente' }, { status: 400 });
    }

    const { nombre, telefono, ciudad, estado, correo } = cliente;

    // Obtener la rifa y verificar precio
    const rifa = await prisma.rifa.findUnique({ where: { id: rifaId } });
    if (!rifa) {
      return NextResponse.json({ error: 'Rifa no encontrada' }, { status: 404 });
    }

    if (rifa.estado !== 'ACTIVA') {
      return NextResponse.json({ error: 'Esta rifa no acepta apartados por ahora' }, { status: 400 });
    }

    const precioBoleto = rifa.precioBoleto;
    const total = boletos.length * precioBoleto;

    // Transacción para apartar de forma segura
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verificar disponibilidad bloqueando la consulta (opcional si la BD soporta FOR UPDATE, prisma aún lo maneja limitado pero lo simulamos aquí)
      const dbBoletos = await tx.boleto.findMany({
        where: {
          rifaId,
          numero: { in: boletos }
        }
      });

      const noDisponibles = dbBoletos.filter(b => b.estado !== 'DISPONIBLE');
      if (noDisponibles.length > 0) {
        throw new Error('Algunos boletos ya no están disponibles');
      }

      // 2. Crear el cliente (o actualizar si ya existe por teléfono, pero crearemos uno nuevo por simplicidad)
      const nuevoCliente = await tx.cliente.create({
        data: {
          nombre,
          telefono,
          ciudad,
          estado,
          correo
        }
      });

      let folio = createFolio();
      for (let attempt = 0; attempt < 5; attempt++) {
        const exists = await tx.orden.findUnique({ where: { folio } });
        if (!exists) break;
        folio = createFolio();
      }

      // 3. Crear orden
      const nuevaOrden = await tx.orden.create({
        data: {
          folio,
          rifaId,
          clienteId: nuevoCliente.id,
          total,
          estado: 'PENDIENTE',
          expiresAt: getOrderExpirationDate()
        }
      });

      // 4. Actualizar estado de boletos
      await tx.boleto.updateMany({
        where: {
          rifaId,
          numero: { in: boletos }
        },
        data: {
          estado: 'APARTADO',
          clienteId: nuevoCliente.id,
          ordenId: nuevaOrden.id,
          apartadoAt: new Date()
        }
      });

      return { orden: nuevaOrden, cliente: nuevoCliente };
    });

    // Formatear números de boleto para el mensaje
    const boletosFormateados = boletos.map((b: number) => {
      return b.toString().padStart(rifa.cantidadBoletos.toString().length, '0');
    });

    const origin = req.headers.get('origin') || '';
    const ordenUrl = `${origin}/mis-boletos/${result.orden.id}`;
    const whatsappUrl = await generateWhatsAppMessage({
      nombre,
      telefono,
      ciudad,
      estado,
      rifaTitulo: rifa.titulo,
      boletos: boletosFormateados,
      total,
      folio: result.orden.folio || result.orden.id.slice(-10).toUpperCase(),
      ordenUrl,
    });

    await logAudit({
      actorType: 'CLIENTE',
      action: 'CREATE_ORDER',
      entityType: 'ORDEN',
      entityId: result.orden.id,
      summary: `${nombre} aparto ${boletosFormateados.length} boleto(s) para ${rifa.titulo}`,
      metadata: {
        folio: result.orden.folio,
        cliente: nombre,
        telefono,
        boletos: boletosFormateados,
        total,
      },
    });

    return NextResponse.json({
      success: true,
      url: whatsappUrl,
      ordenId: result.orden.id,
      ordenUrl: `/mis-boletos/${result.orden.id}`,
    });

  } catch (error) {
    console.error('Error apartando boletos:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
