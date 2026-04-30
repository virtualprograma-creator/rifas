'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function WinnerButton({ rifaId }: { rifaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualBoleto, setManualBoleto] = useState('');
  const [showManual, setShowManual] = useState(false);

  const elegir = async (isAzar: boolean) => {
    if (!isAzar && !manualBoleto) {
      setError('Ingresa un número de boleto');
      return;
    }

    if (!window.confirm(isAzar ? '¿Deseas elegir un ganador al azar entre los boletos pagados?' : `¿Confirmas que el boleto #${manualBoleto} es el ganador?`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/rifas/${rifaId}/ganador`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualBoleto: isAzar ? null : manualBoleto })
      });
      
      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setError(data.error || 'No se pudo establecer el ganador');
        return;
      }

      setManualBoleto('');
      setShowManual(false);
      router.refresh();
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-100">{error}</div>}
      
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => elegir(true)}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Procesando...' : 'Elegir al azar 🎲'}
        </button>

        <button
          type="button"
          onClick={() => setShowManual(!showManual)}
          className="inline-flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          {showManual ? 'Cancelar' : 'Poner manualmente ✍️'}
        </button>
      </div>

      {showManual && (
        <div className="flex items-center gap-2 max-w-sm p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
          <input
            type="text"
            placeholder="Ej: 054"
            value={manualBoleto}
            onChange={(e) => setManualBoleto(e.target.value)}
            className="flex-grow rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={() => elegir(false)}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-500 transition-colors disabled:opacity-50"
          >
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}
