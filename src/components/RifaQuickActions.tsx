'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type RifaQuickActionsProps = {
  rifaId: string;
  estadoActual: string;
};

export function RifaQuickActions({ rifaId, estadoActual }: RifaQuickActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (nuevoEstado: string) => {
    if (loading) return;
    
    let razonEstado = '';
    
    if (nuevoEstado === 'PAUSADA') {
      const razon = window.prompt('¿Por qué deseas pausar esta rifa? (Aparecerá en la página pública)');
      if (razon === null) return;
      razonEstado = razon;
    } else if (nuevoEstado === 'CANCELADA') {
      const razon = window.prompt('¿Por qué deseas cancelar esta rifa? (ACCIÓN IRREVERSIBLE)');
      if (razon === null) return;
      razonEstado = razon;
    } else if (nuevoEstado === 'ACTIVA') {
      if (!window.confirm('¿Deseas reactivar esta rifa?')) return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/rifas/${rifaId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado, razonEstado }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'No se pudo actualizar el estado');
      } else {
        router.refresh();
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {estadoActual === 'ACTIVA' && (
        <>
          <button
            onClick={() => updateStatus('PAUSADA')}
            disabled={loading}
            className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200 transition-colors disabled:opacity-50"
          >
            {loading ? '...' : 'Pausar'}
          </button>
          <button
            onClick={() => updateStatus('CANCELADA')}
            disabled={loading}
            className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            {loading ? '...' : 'Cancelar'}
          </button>
        </>
      )}
      {estadoActual === 'PAUSADA' && (
        <button
          onClick={() => updateStatus('ACTIVA')}
          disabled={loading}
          className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Activar'}
        </button>
      )}
    </div>
  );
}
