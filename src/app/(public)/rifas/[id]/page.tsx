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
    <main className="min-h-screen bg-[#f4f7f1] dark:bg-[#071710] pb-20 pt-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header de la rifa */}
        <div className="bg-white dark:bg-[#0b2419] rounded-3xl shadow-xl overflow-hidden mb-8 border border-gold-500/10 dark:border-gold-500/5 p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contenedor de la Imagen */}
            <div className="lg:col-span-5 flex items-center justify-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-2 md:p-4 border border-slate-100 dark:border-slate-800/80 max-w-full overflow-hidden">
              <img 
                src={rifa.imagenUrl || '/placeholder.jpg'} 
                alt={rifa.titulo} 
                className="w-full h-auto max-h-[450px] object-contain rounded-xl shadow-sm transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
            
            {/* Contenedor de Detalles */}
            <div className="lg:col-span-7 flex flex-col justify-between py-2">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider ${
                    rifa.estado === 'ACTIVA' ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' :
                    rifa.estado === 'PAUSADA' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' :
                    'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                  }`}>
                    {rifa.estado}
                  </span>
                  <span className="text-gold-400 dark:text-gold-300 font-bold text-sm flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Sorteo: {formatSpanishDate(rifa.fechaSorteo)}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                  {rifa.titulo}
                </h1>
                
                <p className="text-slate-600 dark:text-slate-300 mb-6 text-base leading-relaxed">
                  {rifa.descripcionCorta}
                </p>
              </div>
              
              {rifa.estado === 'FINALIZADA' ? (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700/80 mb-2 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">Rifa Concluida</h3>
                  <p className="text-base text-slate-500 dark:text-slate-400">La venta de boletos ha terminado. ¡Gracias por participar!</p>
                </div>
              ) : rifa.estado === 'PAUSADA' ? (
                <div className="bg-amber-50 dark:bg-amber-950/30 p-6 rounded-xl border border-amber-200/50 dark:border-amber-800/30 mb-2 text-center">
                  <h3 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-2">⏸️ Rifa Pausada</h3>
                  <p className="text-amber-700 dark:text-amber-300">
                    {rifa.razonEstado || 'Esta rifa se encuentra pausada temporalmente. Por favor, vuelve más tarde.'}
                  </p>
                </div>
              ) : rifa.estado === 'CANCELADA' ? (
                <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-xl border border-red-200/50 dark:border-red-800/30 mb-2 text-center">
                  <h3 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">🚫 Rifa Cancelada</h3>
                  <p className="text-red-700 dark:text-red-300">
                    {rifa.razonEstado || 'Esta rifa ha sido cancelada. Lamentamos los inconvenientes.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-semibold">Precio</div>
                      <div className="text-2xl font-black text-gold-500 dark:text-gold-400">${rifa.precioBoleto.toFixed(2)}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-semibold">Boletos</div>
                      <div className="text-2xl font-black text-slate-800 dark:text-slate-200">{rifa.cantidadBoletos}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-semibold">Disponibles</div>
                      <div className="text-2xl font-black text-green-600 dark:text-green-400">{disponibles}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-semibold">Vendido</div>
                      <div className="text-2xl font-black text-brand-500 dark:text-brand-400">{porcentaje}%</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span>Progreso de venta</span>
                      <span>{porcentaje}% completado</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-900/50 rounded-full h-3 overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
                      <div 
                        className="bg-gradient-to-r from-brand-500 to-gold-400 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    <a 
                      href="#comprar-boletos"
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 dark:bg-brand-700 dark:hover:bg-brand-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-brand-600/10 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                      </svg>
                      Ver y seleccionar boletos
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Descripción detallada */}
        <div className="bg-white dark:bg-[#0b2419] rounded-3xl shadow-xl border border-gold-500/10 dark:border-gold-500/5 p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-gold-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Detalles del Sorteo
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-base">
            {rifa.descripcionCompleta}
          </p>
        </div>

        {rifa.estado === 'ACTIVA' ? (
          <div id="comprar-boletos" className="scroll-mt-6">
            <RifaClientView 
              rifaId={rifa.id} 
              precioBoleto={rifa.precioBoleto} 
              boletos={boletos} 
            />
          </div>
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
