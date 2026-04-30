'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ExpireOrdersButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const liberar = async () => {
    setLoading(true);
    await fetch('/api/admin/ordenes/liberar-vencidas', { method: 'POST' });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={liberar}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-60 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20"
    >
      {loading ? 'Liberando...' : 'Liberar vencidas'}
    </button>
  );
}
