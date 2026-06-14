'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type SettingsFormProps = {
  initialWhatsAppNumber: string;
};

export function SettingsForm({ initialWhatsAppNumber }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState(initialWhatsAppNumber);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsappNumber,
        }),
      });
      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setError(data.error || 'No se pudo guardar la configuración');
        return;
      }

      setSuccess('Configuración guardada correctamente');
      router.refresh();
    } catch {
      setLoading(false);
      setError('Ocurrió un error al enviar los datos');
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && <Alert tone="error" text={error} />}
      {success && <Alert tone="success" text={success} />}

      <div className="space-y-2">
        <label htmlFor="whatsapp-input" className="block text-sm font-bold tracking-wide text-slate-700 dark:text-slate-300">
          Número de WhatsApp
        </label>
        <div className="relative rounded-xl shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg className="h-5 w-5 text-slate-400 dark:text-slate-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.451L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.977 14.113.951 11.999.951 6.566.951 2.14 5.323 2.137 10.753c-.001 1.718.452 3.393 1.312 4.887L2.484 21.05l5.589-1.446c1.554.849 3.033 1.299 4.574 1.299" />
            </svg>
          </div>
          <input
            id="whatsapp-input"
            type="text"
            value={whatsappNumber}
            onChange={(event) => setWhatsappNumber(event.target.value)}
            required
            placeholder="Ej: 7441351057 o 5217441351057"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 text-slate-900 outline-none ring-offset-background transition-all duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:ring-brand-500/15"
          />
        </div>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Introduce el número con la clave del país (ej. para México <strong>52</strong> o <strong>521</strong> seguido de los 10 dígitos, o simplemente el número de 10 dígitos y el sistema le agregará <strong>52</strong> automáticamente).
        </p>
      </div>

      <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4 dark:border-blue-500/5">
        <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Nota importante</h4>
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          Este número es el canal principal donde tus clientes te notificarán sus compras y enviarán sus comprobantes de pago. Asegúrate de que tenga una cuenta de WhatsApp activa y configurada para recibir mensajes de desconocidos.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="relative flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-600 px-6 py-3 font-bold text-white shadow-md shadow-brand-500/15 transition-all duration-200 hover:bg-brand-500 hover:shadow-brand-500/25 active:scale-[0.99] disabled:opacity-60 disabled:shadow-none"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z" />
            </svg>
            Guardando...
          </span>
        ) : (
          'Guardar configuración'
        )}
      </button>
    </form>
  );
}

function Alert({ tone, text }: { tone: 'error' | 'success'; text: string }) {
  const styles = tone === 'error'
    ? 'border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400'
    : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400';

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold backdrop-blur-sm ${styles}`}>
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {tone === 'error' ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.9 4h13.8c1.5 0 2.5-1.7 1.7-3L13.7 4c-.8-1.3-2.7-1.3-3.5 0L3.3 16c-.7 1.3.2 3 1.8 3z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        )}
      </svg>
      <span>{text}</span>
    </div>
  );
}
