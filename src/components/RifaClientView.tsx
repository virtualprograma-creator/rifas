'use client';

import { useState } from 'react';
import { useCallback } from 'react';
import { BoletoGrid, BoletoType } from './BoletoGrid';
import { ClienteForm, ClienteFormData } from './ClienteForm';

interface RifaClientViewProps {
  rifaId: string;
  precioBoleto: number;
  boletos: BoletoType[];
}

export function RifaClientView({ rifaId, precioBoleto, boletos }: RifaClientViewProps) {
  const [seleccionados, setSeleccionados] = useState<BoletoType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{
    ordenUrl: string;
    whatsappUrl: string;
  } | null>(null);

  const handleSeleccionChange = useCallback((nuevos: BoletoType[]) => {
    setSeleccionados(nuevos);
  }, []);

  const handleApartar = async (cliente: ClienteFormData) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await fetch('/api/apartar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rifaId,
          boletos: seleccionados.map(b => b.numero),
          cliente
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ocurrió un error al apartar los boletos');
      }

      if (result.success && result.ordenId) {
        setSuccess({
          ordenUrl: result.ordenUrl || `/mis-boletos/${result.ordenId}`,
          whatsappUrl: result.url || '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al apartar los boletos');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">Selecciona tus boletos</h2>
          <BoletoGrid 
            boletos={boletos} 
            onSeleccionChange={handleSeleccionChange} 
            maxSeleccion={20}
          />
        </div>
      </div>
      
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 border border-red-200 dark:border-red-800 text-sm">
              <span className="font-bold">Error: </span> {error}
            </div>
          )}
          
          <ClienteForm 
            boletosSeleccionados={seleccionados}
            precioBoleto={precioBoleto}
            onSubmit={handleApartar}
            isLoading={isSubmitting}
          />
        </div>
      </div>

      {success && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-900/70 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-[#0b2419] sm:p-10">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#0f4b5a] text-white">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-gold-100">
              Boletos registrados correctamente!
            </h3>
            <p className="mt-3 text-slate-700 dark:text-slate-200">
              Tu apartado quedo registrado. Podras subir tu comprobante en la pantalla de tus boletos.
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Tus numeros se liberaran automaticamente si no se confirma el pago a tiempo.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  window.location.href = success.ordenUrl;
                }}
                className="min-h-12 rounded-2xl bg-[#35a9b8] px-8 font-extrabold uppercase text-white shadow-lg shadow-cyan-700/20 transition hover:bg-[#258d9b]"
              >
                Ver mis boletos
              </button>
              {success.whatsappUrl && (
                <a
                  href={success.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-12 rounded-2xl border border-brand-700 px-8 py-3 font-bold text-brand-800 transition hover:bg-brand-50 dark:border-gold-300 dark:text-gold-100 dark:hover:bg-[#123527]"
                >
                  Abrir WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
