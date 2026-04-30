'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminUserForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: formData.get('nombre'),
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || 'No se pudo crear el usuario');
      return;
    }

    event.currentTarget.reset();
    setSuccess('Usuario admin creado');
    router.refresh();
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-4"
    >
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Nuevo administrador</h3>
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">{error}</div>}
      {success && <div className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">{success}</div>}
      <Input label="Nombre" name="nombre" required />
      <Input label="Correo" name="email" type="email" required />
      <Input label="Contraseña" name="password" type="password" required minLength={6} />
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-500 disabled:opacity-60"
      >
        {loading ? 'Creando...' : 'Crear admin'}
      </button>
    </form>
  );
}

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
      />
    </div>
  );
}
