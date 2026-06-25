'use client';

import { useState } from 'react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        window.location.href = '/admin';
      } else {
        const data = await res.json();
        setError(data.error || 'Error al iniciar sesion');
      }
    } catch {
      setError('Ocurrio un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#052d20] px-4">
      <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(45deg,transparent_25%,#f8c94a_25%,#f8c94a_26%,transparent_26%,transparent_50%,#f8c94a_50%,#f8c94a_51%,transparent_51%,transparent_75%,#f8c94a_75%,#f8c94a_76%,transparent_76%)] bg-size-[36px_36px]"></div>
      <div className="max-w-md w-full bg-white/95 dark:bg-[#0b2419] rounded-3xl shadow-2xl p-8 border border-gold-400/30 relative z-10">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-500 mb-3">interRIFAS</p>
          <h1 className="text-3xl font-bold text-brand-900 dark:text-gold-100 mb-2">Admin Panel</h1>
          <p className="text-slate-500 dark:text-brand-100/70">Ingresa tus credenciales para administrar el sistema</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-brand-900 dark:text-brand-100 mb-2">
              Correo Electronico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gold-500/30 bg-brand-50/60 dark:bg-[#071710] text-brand-900 dark:text-white focus:ring-2 focus:ring-gold-300 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-900 dark:text-brand-100 mb-2">Contrasena</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gold-500/30 bg-brand-50/60 dark:bg-[#071710] text-brand-900 dark:text-white focus:ring-2 focus:ring-gold-300 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-900/20 transition-all disabled:opacity-70 disabled:cursor-wait border border-gold-300/20"
          >
            {loading ? 'Iniciando sesion...' : 'Entrar al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
