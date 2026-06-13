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
      setError('Ingresa un numero de boleto');
      return;
    }

    const message = isAzar
      ? 'Deseas elegir un ganador al azar entre los boletos pagados?'
      : `Confirmas que el boleto #${manualBoleto} es el ganador?`;

    if (!window.confirm(message)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/rifas/${rifaId}/ganador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualBoleto: isAzar ? null : manualBoleto }),
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
    } catch {
      setError('Error de conexion');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">{error}</div>}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => elegir(true)}
          disabled={loading}
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-600 px-3 text-sm font-bold text-white transition-colors hover:bg-brand-500 disabled:opacity-60"
        >
          {loading ? 'Procesando...' : 'Elegir al azar'}
        </button>

        <button
          type="button"
          onClick={() => setShowManual(!showManual)}
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-100 px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          {showManual ? 'Cancelar' : 'Poner manualmente'}
        </button>
      </div>

      {showManual && (
        <div className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800 sm:grid-cols-[1fr_auto]">
          <input
            type="text"
            placeholder="Ej: 054"
            value={manualBoleto}
            onChange={(event) => setManualBoleto(event.target.value)}
            className="min-h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900"
          />
          <button
            type="button"
            onClick={() => elegir(false)}
            disabled={loading}
            className="min-h-10 rounded-lg bg-green-600 px-4 text-sm font-bold text-white transition-colors hover:bg-green-500 disabled:opacity-50"
          >
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}
