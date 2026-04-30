'use client';

import { useEffect, useState } from 'react';

export function OrderCountdown({ expiresAt }: { expiresAt?: string | null }) {
  const [remaining, setRemaining] = useState(expiresAt ? '' : 'Sin vencimiento');

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('Vencido');
        return;
      }

      const hours = Math.floor(diff / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      const seconds = Math.floor((diff % 60_000) / 1000);
      setRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);

  return <span>{remaining}</span>;
}
