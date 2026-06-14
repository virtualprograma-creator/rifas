'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AdminOrderActionsProps {
  ordenId: string;
  estado: string;
  comprobanteUrl?: string | null;
  notasPago?: string | null;
}

export function AdminOrderActions({ ordenId, estado, comprobanteUrl, notasPago }: AdminOrderActionsProps) {
  const router = useRouter();
  const [nextEstado, setNextEstado] = useState(estado);
  const [comprobante, setComprobante] = useState(comprobanteUrl || '');
  const [notas, setNotas] = useState(notasPago || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setLoading(true);
    setError('');

    const response = await fetch(`/api/admin/ordenes/${ordenId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado: nextEstado,
        comprobanteUrl: comprobante,
        notasPago: notas,
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || 'No se pudo actualizar la orden');
      return;
    }

    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-4">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Gestionar orden</h3>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Estado</label>
        <select
          value={nextEstado}
          onChange={(event) => setNextEstado(event.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_REVISION">Pendiente de validación</option>
          <option value="PAGADA">Pagada</option>
          <option value="RECHAZADA">Rechazada</option>
          <option value="CANCELADA">Cancelada</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          URL del comprobante
        </label>
        <input
          type="url"
          value={comprobante}
          onChange={(event) => setComprobante(event.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notas de pago</label>
        <textarea
          value={notas}
          onChange={(event) => setNotas(event.target.value)}
          rows={4}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <button
        type="button"
        onClick={save}
        disabled={loading}
        className="w-full rounded-xl bg-brand-600 px-4 py-3 font-bold text-white hover:bg-brand-500 disabled:opacity-60"
      >
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  );
}
