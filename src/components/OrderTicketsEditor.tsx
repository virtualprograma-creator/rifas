'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface OrderTicketsEditorProps {
  ordenId: string;
  boletos: {
    id: string;
    numeroFormateado: string;
    estado: string;
  }[];
}

export function OrderTicketsEditor({ ordenId, boletos }: OrderTicketsEditorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = (boletoId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(boletoId)) {
        next.delete(boletoId);
      } else {
        next.add(boletoId);
      }
      return next;
    });
  };

  const removeSelected = async () => {
    if (selected.size === 0) return;

    const confirmed = window.confirm(
      `Se liberaran ${selected.size} boleto(s) y se recalculara el total de la orden.`
    );
    if (!confirmed) return;

    setLoading(true);
    setError('');

    const response = await fetch(`/api/admin/ordenes/${ordenId}/boletos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boletoIds: Array.from(selected) }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || 'No se pudieron quitar los boletos');
      return;
    }

    setSelected(new Set());
    router.refresh();
  };

  if (boletos.length === 0) {
    return <p className="text-sm text-slate-500">Esta orden no tiene boletos asociados.</p>;
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">{error}</div>}

      <div className="flex flex-wrap gap-2">
        {boletos.map((boleto) => {
          const isSelected = selected.has(boleto.id);

          return (
            <button
              key={boleto.id}
              type="button"
              onClick={() => toggle(boleto.id)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                isSelected
                  ? 'border-red-400 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'border-slate-200 text-slate-700 hover:border-brand-400 dark:border-slate-700 dark:text-slate-200'
              }`}
              title={`Boleto ${boleto.numeroFormateado} - ${boleto.estado}`}
            >
              {boleto.numeroFormateado}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {selected.size === 0 ? 'Selecciona los boletos que quieres liberar.' : `${selected.size} seleccionado(s).`}
        </p>
        <button
          type="button"
          onClick={removeSelected}
          disabled={selected.size === 0 || loading}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-60"
        >
          {loading ? 'Quitando...' : 'Quitar seleccionados'}
        </button>
      </div>
    </div>
  );
}
