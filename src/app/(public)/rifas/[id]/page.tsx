import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { RifaClientView } from '@/components/RifaClientView';
import type { BoletoType, EstadoBoleto } from '@/components/BoletoGrid';
import { formatSpanishDate } from '@/lib/dates';

// Next.js 15 requires awaiting params
type Props = {
  params: Promise<{ id: string }>
}

export default async function RifaDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const normalizedId = id.toLowerCase();
  
  const rifa = await prisma.rifa.findFirst({
    where: normalizedId.length === 10 ? { id: { endsWith: normalizedId } } : { id },
    include: {
      boletos: {
        orderBy: { numero: 'asc' }
      }
    }
  });

  if (!rifa) {
    notFound();
  }

  // Count available
  const disponibles = rifa.boletos.filter(b => b.estado === 'DISPONIBLE').length;
  const porcentaje = Math.round(((rifa.cantidadBoletos - disponibles) / rifa.cantidadBoletos) * 100);
  const boletos: BoletoType[] = rifa.boletos.map((boleto) => ({
    id: boleto.id,
    numero: boleto.numero,
    numeroFormateado: boleto.numeroFormateado,
    estado: boleto.estado as EstadoBoleto,
  }));

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 pt-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header de la rifa */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg overflow-hidden mb-8 border border-slate-100 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2 h-64 md:h-full min-h-[300px]">
              <img 
                src={rifa.imagenUrl || '/placeholder.jpg'} 
                alt={rifa.titulo} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-8 lg:col-span-3 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  rifa.estado === 'ACTIVA' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  rifa.estado === 'PAUSADA' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {rifa.estado}
                </span>
                <span className="text-brand-600 dark:text-brand-400 font-semibold text-sm">
                  Rifa: {formatSpanishDate(rifa.fechaSorteo)}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                {rifa.titulo}
              </h1>
              
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {rifa.descripcionCompleta}
              </p>
              
              {rifa.estado === 'FINALIZADA' ? (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700 mb-6 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">Rifa Concluida</h3>
                  <p className="text-base text-slate-500 dark:text-slate-400">La venta de boletos ha terminado. ¡Gracias por participar!</p>
                </div>
              ) : rifa.estado === 'PAUSADA' ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-700/50 mb-6 text-center">
                  <h3 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-2">⏸️ Rifa Pausada</h3>
                  <p className="text-amber-700 dark:text-amber-300">
                    {rifa.razonEstado || 'Esta rifa se encuentra pausada temporalmente. Por favor, vuelve más tarde.'}
                  </p>
                </div>
              ) : rifa.estado === 'CANCELADA' ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-700/50 mb-6 text-center">
                  <h3 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">🚫 Rifa Cancelada</h3>
                  <p className="text-red-700 dark:text-red-300">
                    {rifa.razonEstado || 'Esta rifa ha sido cancelada. Lamentamos los inconvenientes.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Precio</div>
                    <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">${rifa.precioBoleto.toFixed(2)}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Boletos</div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{rifa.cantidadBoletos}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Disponibles</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{disponibles}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Vendido</div>
                    <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{porcentaje}%</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {rifa.estado === 'ACTIVA' ? (
          <RifaClientView 
            rifaId={rifa.id} 
            precioBoleto={rifa.precioBoleto} 
            boletos={boletos} 
          />
        ) : rifa.estado === 'FINALIZADA' ? (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 rounded-3xl shadow-lg p-10 border-2 border-amber-200 dark:border-amber-700 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(45deg,transparent_25%,#f8c94a_25%,#f8c94a_26%,transparent_26%,transparent_50%,#f8c94a_50%,#f8c94a_51%,transparent_51%,transparent_75%,#f8c94a_75%,#f8c94a_76%,transparent_76%)] bg-size-[32px_32px]"></div>
            <div className="relative z-10">
              <span className="inline-block bg-amber-500 text-white font-black uppercase tracking-widest text-sm px-4 py-1.5 rounded-full mb-6 shadow-md">RIFA FINALIZADA</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-brand-900 dark:text-white mb-4">
                ¡Tenemos un Ganador!
              </h2>
              <p className="text-lg md:text-xl text-amber-800 dark:text-amber-200 mb-8 max-w-2xl mx-auto">
                Felicidades al afortunado ganador de la rifa. Agradecemos a todos por su participación.
              </p>
              
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 max-w-lg mx-auto shadow-xl border border-gold-500/30 transform hover:scale-105 transition-transform duration-300">
                <div className="w-20 h-20 bg-gold-100 dark:bg-gold-900/30 text-gold-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-gold-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{rifa.ganadorCliente || 'Anónimo'}</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1 mb-4">Boleto Ganador</p>
                <div className="inline-block bg-brand-900 text-gold-400 font-mono text-3xl font-bold px-6 py-2 rounded-xl tracking-widest shadow-inner">
                  #{rifa.ganadorBoleto}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 border border-slate-100 dark:border-slate-700 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Rifa no disponible</h2>
            <p className="text-slate-500">Esta rifa esta {rifa.estado.toLowerCase()} y no acepta apartados por ahora.</p>
          </div>
        )}
      </div>
    </main>
  );
}
