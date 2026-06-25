import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { displayFolio } from '@/lib/folio';

export const revalidate = 0;

const ESTADOS_PUBLICOS: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  APARTADO: 'Apartado',
  PAGADO: 'Pagado',
  CANCELADO: 'Cancelado',
};

export async function GET(request: NextRequest) {
  const busqueda = request.nextUrl.searchParams.get('numero')?.trim() ?? '';
  const folioNormalizado = busqueda.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const esFolio = /[a-zA-Z]/.test(busqueda);
  const digitos = busqueda.replace(/\D/g, '');
  const numeroSinCeros = digitos.replace(/^0+/, '');
  const numeroExacto = numeroSinCeros ? Number(numeroSinCeros) : null;

  if (!folioNormalizado) {
    return NextResponse.json({ error: 'Ingresa un folio o numero de boleto' }, { status: 400 });
  }

  if (esFolio) {
    if (folioNormalizado.length !== 10) {
      return NextResponse.json({ error: 'El folio debe tener 10 caracteres' }, { status: 400 });
    }

    const orden = await prisma.orden.findFirst({
      where: {
        OR: [{ folio: folioNormalizado.toUpperCase() }, { id: { endsWith: folioNormalizado } }],
      },
      include: {
        boletos: {
          orderBy: { numero: 'asc' },
          select: {
            id: true,
            numero: true,
            numeroFormateado: true,
            estado: true,
            rifa: {
              select: {
                id: true,
                titulo: true,
                precioBoleto: true,
                fechaSorteo: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      tipo: 'folio',
      boletos:
        orden?.boletos.map((boleto) => ({
          id: boleto.id,
          numero: boleto.numero,
          numeroFormateado: boleto.numeroFormateado,
          estado: boleto.estado,
          estadoTexto: ESTADOS_PUBLICOS[boleto.estado] ?? boleto.estado,
          folio: displayFolio(orden),
          ordenUrl: `/mis-boletos/${orden.id}`,
          rifa: {
            ...boleto.rifa,
            fechaSorteo: boleto.rifa.fechaSorteo.toISOString(),
          },
        })) ?? [],
    });
  }

  if (!digitos) {
    return NextResponse.json({ error: 'Ingresa un numero de boleto valido' }, { status: 400 });
  }

  if (digitos.length > 8) {
    return NextResponse.json({ error: 'El numero de boleto es demasiado largo' }, { status: 400 });
  }

  if (!numeroExacto || !Number.isSafeInteger(numeroExacto)) {
    return NextResponse.json({ error: 'Ingresa un numero de boleto valido' }, { status: 400 });
  }

  const boletos = await prisma.boleto.findMany({
    where: {
      rifa: { estado: 'ACTIVA' },
      numero: numeroExacto,
    },
    orderBy: [{ rifaId: 'asc' }, { numero: 'asc' }],
    take: 50,
    select: {
      id: true,
      numero: true,
      numeroFormateado: true,
      estado: true,
      orden: {
        select: { id: true, folio: true },
      },
      rifa: {
        select: {
          id: true,
          titulo: true,
          precioBoleto: true,
          fechaSorteo: true,
        },
      },
    },
  });

  return NextResponse.json({
    boletos: boletos.map((boleto) => ({
      id: boleto.id,
      numero: boleto.numero,
      numeroFormateado: boleto.numeroFormateado,
      estado: boleto.estado,
      estadoTexto: ESTADOS_PUBLICOS[boleto.estado] ?? boleto.estado,
      folio: null, // Ocultado por seguridad al buscar por número de boleto
      ordenUrl: null, // Ocultado por seguridad al buscar por número de boleto
      rifa: {
        ...boleto.rifa,
        fechaSorteo: boleto.rifa.fechaSorteo.toISOString(),
      },
    })),
  });
}
