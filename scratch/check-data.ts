import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rifasCount = await prisma.rifa.count();
  const boletosCount = await prisma.boleto.count();
  
  console.log(`Rifas: ${rifasCount}`);
  console.log(`Boletos: ${boletosCount}`);
  
  const rifas = await prisma.rifa.findMany({
    include: {
      _count: {
        select: { boletos: true }
      }
    }
  });
  
  rifas.forEach(rifa => {
    console.log(`Rifa: ${rifa.titulo} - Boletos: ${rifa._count.boletos} / ${rifa.cantidadBoletos}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
