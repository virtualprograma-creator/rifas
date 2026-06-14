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

  const updateStatus = async (nuevoEstado: string, razonEstado = '') => {
    if (loading) return;

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
        return;
      }

      router.refresh();
    } catch {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const pauseRifa = () => {
    const razon = window.prompt('¿Por qué deseas pausar esta rifa? Aparecerá en la página pública.');
    if (razon === null) return;
    updateStatus('PAUSADA', razon);
  };

  const restoreRifa = () => {
    if (!window.confirm('¿Deseas restaurar esta rifa y volverla activa?')) return;
    updateStatus('ACTIVA');
  };

  const deleteRifa = () => {
    const razon = window.prompt('Motivo para eliminar/ocultar esta rifa. Podrás restaurarla después.');
    if (razon === null) return;
    updateStatus('CANCELADA', razon || 'Rifa eliminada temporalmente');
  };

  const buttonBase =
    'min-h-9 rounded-lg px-2 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 lg:min-h-0 lg:rounded lg:py-1';

  if (estadoActual === 'CANCELADA') {
    return (
      <div className="grid gap-2 lg:flex lg:items-center">
        <button
          onClick={restoreRifa}
          disabled={loading}
          className={`${buttonBase} bg-green-100 text-green-700 hover:bg-green-200`}
        >
          {loading ? '...' : 'Restaurar'}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center">
      {estadoActual === 'ACTIVA' && (
        <button
          onClick={pauseRifa}
          disabled={loading}
          className={`${buttonBase} bg-amber-100 text-amber-700 hover:bg-amber-200`}
        >
          {loading ? '...' : 'Pausar'}
        </button>
      )}

      {estadoActual === 'PAUSADA' && (
        <button
          onClick={restoreRifa}
          disabled={loading}
          className={`${buttonBase} bg-green-100 text-green-700 hover:bg-green-200`}
        >
          {loading ? '...' : 'Activar'}
        </button>
      )}

      <button
        onClick={deleteRifa}
        disabled={loading}
        className={`${buttonBase} bg-red-100 text-red-700 hover:bg-red-200`}
      >
        {loading ? '...' : 'Eliminar'}
      </button>
    </div>
  );
}
