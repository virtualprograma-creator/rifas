import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

type CrearRifaRequestBody = {
  titulo?: string;
  categoria?: string;
  descripcionCorta?: string;
  descripcionCompleta?: string;
  imagenUrl?: string;
  precioBoleto?: string | number;
  cantidadBoletos?: string | number;
  fechaSorteo?: string;
  metodosPago?: {
    banco?: string;
    logoUrl?: string;
    titular?: string;
    numeroTarjeta?: string;
    clabe?: string;
  }[];
};

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = (await req.json()) as CrearRifaRequestBody;
    
    // Validar datos básicos
    const { titulo, categoria, descripcionCorta, descripcionCompleta, imagenUrl, precioBoleto, cantidadBoletos, fechaSorteo } = data;
    
    if (!titulo || !precioBoleto || !cantidadBoletos || !fechaSorteo) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const precioBoletoNumber = Number(precioBoleto);
    const cantidadBoletosNumber = Number(cantidadBoletos);

    if (!Number.isFinite(precioBoletoNumber) || !Number.isInteger(cantidadBoletosNumber) || cantidadBoletosNumber < 1) {
      return NextResponse.json({ error: 'Precio o cantidad de boletos invalida' }, { status: 400 });
    }

    const metodosPago = (data.metodosPago || [])
      .map((metodo, index) => ({
        banco: metodo.banco?.trim() || '',
        logoUrl: metodo.logoUrl?.trim() || null,
        titular: metodo.titular?.trim() || '',
        numeroTarjeta: metodo.numeroTarjeta?.replace(/\s/g, '') || null,
        clabe: metodo.clabe?.replace(/\s/g, '') || null,
        orden: index,
      }))
      .filter((metodo) => metodo.banco && metodo.titular && (metodo.numeroTarjeta || metodo.clabe));

    // Generar boletos
    const boletos: { numero: number; numeroFormateado: string; estado: 'DISPONIBLE' }[] = [];
    const lengthStr = cantidadBoletosNumber.toString().length;
    
    for (let i = 1; i <= cantidadBoletosNumber; i++) {
      boletos.push({
        numero: i,
        numeroFormateado: i.toString().padStart(lengthStr, '0'),
        estado: 'DISPONIBLE'
      });
    }

    // Crear la rifa, bancos y boletos
    const nuevaRifa = await prisma.rifa.create({
      data: {
        titulo,
        categoria: categoria || 'General',
        descripcionCorta: descripcionCorta || '',
        descripcionCompleta: descripcionCompleta || '',
        imagenUrl: imagenUrl || '',
        precioBoleto: precioBoletoNumber,
        cantidadBoletos: cantidadBoletosNumber,
        fechaSorteo: new Date(fechaSorteo),
        estado: 'ACTIVA',
        metodosPago: {
          create: metodosPago,
        },
        boletos: {
          createMany: {
            data: boletos,
          },
        },
      }
    });

    await logAdminAction({
      action: 'CREATE_RIFA',
      entityType: 'RIFA',
      entityId: nuevaRifa.id,
      summary: `Creo la rifa ${nuevaRifa.titulo} con ${cantidadBoletosNumber} boletos`,
      metadata: {
        titulo: nuevaRifa.titulo,
        cantidadBoletos: cantidadBoletosNumber,
        metodosPago: metodosPago.length,
      },
    });

    return NextResponse.json({ success: true, rifa: nuevaRifa });
    
  } catch (error) {
    console.error('Error al crear rifa:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
