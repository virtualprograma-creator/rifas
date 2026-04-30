'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type MetodoPago = {
  id: string;
  banco: string;
  logoUrl: string | null;
  titular: string;
  numeroTarjeta: string | null;
  clabe: string | null;
};

export function PaymentMethods({
  metodos,
  ordenId,
  selectedMetodoPagoId,
}: {
  metodos: MetodoPago[];
  ordenId: string;
  selectedMetodoPagoId?: string | null;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(selectedMetodoPagoId || metodos[0]?.id || '');
  const [copied, setCopied] = useState('');

  if (metodos.length === 0) {
    return null;
  }

  const selected = metodos.find((metodo) => metodo.id === selectedId) || metodos[0];

  const selectMetodo = async (metodoId: string) => {
    setSelectedId(metodoId);
    const response = await fetch(`/api/ordenes/${ordenId}/metodo-pago`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metodoPagoId: metodoId }),
    });
    if (response.ok) router.refresh();
  };

  const copy = async (label: string, value: string | null) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(''), 1500);
  };

  return (
    <section className="mb-5 rounded-2xl bg-white p-5 text-center shadow-sm dark:bg-[#0b2419]">
      <div className="mb-4 flex justify-center gap-3">
        {metodos.map((metodo) => {
          const isSelected = metodo.id === selected.id;
          return (
            <button
              key={metodo.id}
              type="button"
              onClick={() => selectMetodo(metodo.id)}
              className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 bg-slate-100 text-xs font-extrabold uppercase transition sm:h-24 sm:w-24 ${
                isSelected
                  ? 'border-[#0f4b5a] opacity-100'
                  : 'border-slate-200 opacity-50 hover:opacity-80 dark:border-slate-700'
              }`}
              aria-label={`Elegir ${metodo.banco}`}
            >
              {metodo.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={metodo.logoUrl} alt={metodo.banco} className="h-full w-full object-cover" />
              ) : (
                <span className="px-2 text-slate-700">{metodo.banco}</span>
              )}
              {isSelected && (
                <span className="absolute -right-1 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0f4b5a] bg-white text-xl font-black text-[#0f4b5a]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <h2 className="text-lg font-extrabold text-slate-900 dark:text-gold-100">{selected.banco}</h2>

      <PaymentValue label="Nro de tarjeta" value={selected.numeroTarjeta} copied={copied} onCopy={copy} />
      <PaymentValue label="CLABE" value={selected.clabe} copied={copied} onCopy={copy} />

      <div className="mt-3">
        <div className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">Titular</div>
        <div className="text-lg text-slate-900 dark:text-white">{selected.titular}</div>
      </div>
    </section>
  );
}

function PaymentValue({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string | null;
  copied: string;
  onCopy: (label: string, value: string | null) => void;
}) {
  if (!value) return null;

  return (
    <div className="mt-3">
      <div className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">{label}</div>
      <div className="flex items-center justify-center gap-2">
        <span className="rounded-xl bg-slate-50 px-3 py-1 text-2xl font-extrabold tracking-wide text-slate-900 dark:bg-slate-900 dark:text-white">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onCopy(label, value)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-[#0f8292] shadow-lg shadow-slate-200 transition hover:bg-slate-50 dark:bg-slate-800 dark:shadow-none"
          aria-label={`Copiar ${label}`}
        >
          {copied === label ? (
            'OK'
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
