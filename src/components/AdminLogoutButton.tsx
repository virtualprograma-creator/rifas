'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="rounded-lg border border-gold-400/40 px-3 py-2 text-sm font-medium text-brand-800 dark:text-gold-100 hover:bg-gold-50 dark:hover:bg-brand-800 disabled:opacity-60"
    >
      {loading ? 'Saliendo...' : 'Salir'}
    </button>
  );
}
