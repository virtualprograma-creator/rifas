'use client';

import { useCallback, useState } from 'react';
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

  const [pendingCliente, setPendingCliente] = useState<ClienteFormData | null>(null);

  const handleApartar = (cliente: ClienteFormData) => {
    setPendingCliente(cliente);
  };

  const handleConfirmApartar = async () => {
    if (!pendingCliente) return;
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
          boletos: seleccionados.map((boleto) => boleto.numero),
          cliente: pendingCliente,
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
        setPendingCliente(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al apartar los boletos');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="premium-card rounded-2xl bg-white p-5 shadow-sm dark:bg-[#0b2419] sm:p-6">
          <div className="relative z-10 mb-6 border-b border-slate-100 pb-4 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600 dark:text-gold-300">Paso 1</p>
            <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">Selecciona tus boletos</h2>
          </div>
          <div className="relative z-10">
            <BoletoGrid boletos={boletos} onSeleccionChange={handleSeleccionChange} maxSeleccion={20} />
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-20">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
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
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-brand-900/70 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-[#0b2419] sm:p-10">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-gold-100">
              Boletos registrados correctamente
            </h3>
            <p className="mt-3 text-slate-700 dark:text-slate-200">
              Tu apartado quedó registrado. Podrás subir tu comprobante en la pantalla de tus boletos.
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Tus números se liberarán automáticamente si no se confirma el pago a tiempo.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  const match = success.ordenUrl.match(/\/mis-boletos\/([a-zA-Z0-9]+)/);
                  if (match && match[1]) {
                    document.cookie = `order_verified_${match[1]}=true; path=/; max-age=31536000; SameSite=Lax`;
                  }
                  window.location.href = success.ordenUrl;
                }}
                className="min-h-12 rounded-2xl bg-brand-600 px-8 font-extrabold uppercase text-white shadow-lg shadow-brand-700/20 transition hover:bg-brand-500"
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

      {pendingCliente && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-brand-900/70 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#0b2419]">
            <h3 className="mb-4 border-b border-slate-100 pb-2 text-2xl font-bold text-slate-900 dark:border-slate-700 dark:text-gold-100">
              Confirma tus datos
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
              Verifica que todo sea correcto antes de apartar los boletos.
            </p>

            <div className="mb-6 space-y-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/50">
              <ConfirmRow label="Boletos" value={seleccionados.map((boleto) => boleto.numeroFormateado).join(', ')} strong />
              <ConfirmRow label="Nombre" value={pendingCliente.nombre} />
              <ConfirmRow label="Teléfono" value={pendingCliente.telefono} />
              <ConfirmRow label="Ubicación" value={`${pendingCliente.ciudad}, ${pendingCliente.estado}`} />
              {pendingCliente.correo && <ConfirmRow label="Correo" value={pendingCliente.correo} />}
              <div className="flex justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
                <span className="text-slate-500">Total a pagar:</span>
                <span className="text-base font-bold text-brand-600 dark:text-brand-400">
                  ${(seleccionados.length * precioBoleto).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPendingCliente(null)}
                className="flex-1 rounded-xl border border-slate-300 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-white/5"
                disabled={isSubmitting}
              >
                Corregir datos
              </button>
              <button
                type="button"
                onClick={handleConfirmApartar}
                className="flex-1 rounded-xl bg-brand-600 py-3 font-bold text-white shadow-lg shadow-brand-500/30 transition-colors hover:bg-brand-500 disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : 'Sí, apartar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-slate-500">{label}:</span>
      <span className={`text-right ${strong ? 'font-bold text-brand-700 dark:text-gold-300' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
        {value}
      </span>
    </div>
  );
}
