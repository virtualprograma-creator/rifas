import { prisma } from '@/lib/prisma';
import { RifaCard } from '@/components/RifaCard';

export const revalidate = 0;

export default async function Home() {
  const rifas = await prisma.rifa.findMany({
    where: {
      estado: { in: ['ACTIVA', 'PAUSADA', 'FINALIZADA', 'CANCELADA'] },
    },
    orderBy: [
      { estado: 'asc' }, // ACTIVA antes que FINALIZADA
      { createdAt: 'desc' },
    ],
    include: {
      _count: {
        select: { boletos: { where: { estado: 'DISPONIBLE' } } },
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#f4f7f1] dark:bg-[#071710] pb-20">
      <div className="bg-[#052d20] text-white py-20 px-4 relative overflow-hidden border-b border-gold-500/30">
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(45deg,transparent_25%,#f8c94a_25%,#f8c94a_26%,transparent_26%,transparent_50%,#f8c94a_50%,#f8c94a_51%,transparent_51%,transparent_75%,#f8c94a_75%,#f8c94a_76%,transparent_76%)] bg-size-[32px_32px]"></div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-300 mb-4">Rifas premium</p>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Participa y Gana <span className="text-gold-300">Grandes Premios</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-100 max-w-2xl mx-auto font-light">
            Explora rifas activas, aparta tus boletos y vive la experiencia de una rifa clara, elegante y segura.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">


        {rifas.length === 0 ? (
          <div className="bg-white dark:bg-[#0b2419] rounded-2xl shadow p-12 text-center border border-gold-500/20">
            <svg className="mx-auto h-16 w-16 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-brand-900 dark:text-gold-100">No hay rifas activas</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Vuelve pronto para ver las nuevas rifas disponibles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {rifas.map((rifa) => (
              <RifaCard
                key={rifa.id}
                id={rifa.id}
                titulo={rifa.titulo}
                descripcionCorta={rifa.descripcionCorta}
                imagenUrl={rifa.imagenUrl}
                precioBoleto={rifa.precioBoleto}
                fechaSorteo={rifa.fechaSorteo}
                boletosDisponibles={rifa._count.boletos}
                boletosTotales={rifa.cantidadBoletos}
                estado={rifa.estado}
                ganadorBoleto={rifa.ganadorBoleto}
                ganadorCliente={rifa.ganadorCliente}
                razonEstado={rifa.razonEstado}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
