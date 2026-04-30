import Link from 'next/link';
import { formatSpanishDate } from '@/lib/dates';

interface RifaProps {
  id: string;
  titulo: string;
  descripcionCorta: string;
  imagenUrl: string;
  precioBoleto: number;
  fechaSorteo: Date;
  boletosDisponibles: number;
  boletosTotales: number;
  estado?: string;
  ganadorBoleto?: string | null;
  ganadorCliente?: string | null;
  razonEstado?: string | null;
}

export function RifaCard({ 
  id, titulo, descripcionCorta, imagenUrl, precioBoleto, fechaSorteo, boletosDisponibles, boletosTotales, estado = 'ACTIVA', ganadorBoleto, ganadorCliente, razonEstado 
}: RifaProps) {
  const porcentajeVendido = Math.round(((boletosTotales - boletosDisponibles) / boletosTotales) * 100);
  const publicId = id.slice(-10).toUpperCase();
  const isFinalizada = estado === 'FINALIZADA';
  const isPausada = estado === 'PAUSADA';
  const isCancelada = estado === 'CANCELADA';
  const noActiva = isFinalizada || isPausada || isCancelada;

  return (
    <div className={`bg-white dark:bg-[#0b2419] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full border ${noActiva ? 'border-amber-500/50 opacity-90' : 'border-gold-500/20'}`}>
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={imagenUrl || '/placeholder.jpg'} 
          alt={titulo} 
          className={`w-full h-full object-cover transition-transform duration-500 ${noActiva ? 'grayscale-[30%]' : 'group-hover:scale-105'}`}
        />
        {isFinalizada && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
            <span className="bg-amber-500 text-white font-black text-xs md:text-sm uppercase tracking-[0.2em] px-5 py-2.5 rounded-full shadow-2xl border border-white/30 transform transition-transform group-hover:scale-105">
              RIFA FINALIZADA
            </span>
          </div>
        )}
        {isPausada && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-amber-600 text-white font-bold py-1 px-3 rounded-full text-sm uppercase tracking-wider">⏸️ Pausado</span>
          </div>
        )}
        {isCancelada && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold py-1 px-3 rounded-full text-sm uppercase tracking-wider">🚫 Cancelado</span>
          </div>
        )}
        {!noActiva && (
          <div className="absolute top-3 right-3 bg-gold-400 text-brand-900 font-bold py-1 px-3 rounded-full shadow-md">
            ${precioBoleto.toFixed(2)}
          </div>
        )}
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-xl font-bold mb-2 text-brand-900 dark:text-gold-100">{titulo}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{descripcionCorta}</p>
        
        <div className="mt-auto space-y-4">
          {!noActiva ? (
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                <span>{boletosDisponibles} boletos disponibles</span>
                <span>{porcentajeVendido}% vendido</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gold-400 h-2 rounded-full" 
                  style={{ width: `${porcentajeVendido}%` }}
                ></div>
              </div>
            </div>
          ) : isFinalizada ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-2 text-center flex flex-col justify-center min-h-[44px]">
              <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold mb-0.5">Ganador: {ganadorCliente || 'Anónimo'}</p>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Boleto #{ganadorBoleto}</p>
            </div>
          ) : (
            <div className={`rounded-lg p-2 text-center flex flex-col justify-center min-h-[44px] border ${isPausada ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'}`}>
               <p className={`text-[11px] font-bold leading-tight ${isPausada ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>
                 {razonEstado || (isPausada ? 'Venta pausada temporalmente' : 'Rifa cancelada')}
               </p>
            </div>
          )}
          
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-slate-500 dark:text-slate-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatSpanishDate(fechaSorteo)}
            </span>
          </div>
          
          <Link 
            href={`/rifas/${publicId}`}
            className={`block w-full text-center font-semibold py-3 rounded-xl transition-colors shadow-md border ${
              noActiva 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600' 
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/20 border-gold-300/20'
            }`}
          >
            {isFinalizada ? 'Ver Resultados' : isPausada ? 'Ver Detalles' : isCancelada ? 'Saber más' : 'Ver Rifa y Boletos'}
          </Link>
        </div>
      </div>
    </div>
  );
}
