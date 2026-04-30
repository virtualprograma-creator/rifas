import { prisma } from '@/lib/prisma';

export const APARTADO_EXPIRATION_HOURS = 24;

export function getOrderExpirationDate(baseDate = new Date()) {
  return new Date(baseDate.getTime() + APARTADO_EXPIRATION_HOURS * 60 * 60 * 1000);
}

export async function liberarOrdenesVencidas() {
  const vencidas = await prisma.orden.findMany({
    where: {
      estado: 'PENDIENTE',
      expiresAt: {
        not: null,
        lt: new Date(),
      },
    },
    select: { id: true },
  });

  if (vencidas.length === 0) {
    return 0;
  }

  const ids = vencidas.map((orden) => orden.id);

  await prisma.$transaction([
    prisma.boleto.updateMany({
      where: { ordenId: { in: ids } },
      data: {
        estado: 'DISPONIBLE',
        clienteId: null,
        ordenId: null,
        apartadoAt: null,
        pagadoAt: null,
      },
    }),
    prisma.orden.updateMany({
      where: { id: { in: ids } },
      data: {
        estado: 'VENCIDA',
        canceladoAt: new Date(),
      },
    }),
  ]);

  return ids.length;
}
