'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminComprobanteActions({ ordenId }: { ordenId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  const update = async (estado: 'PAGADA' | 'RECHAZADA') => {
    setLoading(estado);
    setError('');

    const response = await fetch(`/api/admin/ordenes/${ordenId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    const data = await response.json();

    setLoading('');
    if (!response.ok) {
      setError(data.error || 'No se pudo actualizar el comprobante');
      return;
    }

    router.refresh();
  };

  return (
    <div className="space-y-2">
      {error && <div className="rounded-lg bg-red-50 p-2 text-xs font-semibold text-red-600">{error}</div>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => update('PAGADA')}
          disabled={Boolean(loading)}
          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-green-500 active:scale-[0.98] disabled:opacity-60"
        >
          {loading === 'PAGADA' ? 'Aprobando...' : 'Aprobar'}
        </button>
        <button
          type="button"
          onClick={() => update('RECHAZADA')}
          disabled={Boolean(loading)}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-500 active:scale-[0.98] disabled:opacity-60"
        >
          {loading === 'RECHAZADA' ? 'Rechazando...' : 'Rechazar'}
        </button>
      </div>
    </div>
  );
}
