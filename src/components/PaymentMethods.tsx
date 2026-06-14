'use client';

import Image from 'next/image';
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
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-[#0b2419]">
        No hay métodos de pago configurados para esta rifa.
      </section>
    );
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
    <section className="premium-card rounded-2xl bg-white p-5 shadow-sm dark:bg-[#0b2419]">
      <div className="relative z-10">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600 dark:text-gold-300">Paso 1</p>
          <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">Elige cómo pagar</h2>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3">
          {metodos.map((metodo) => {
            const isSelected = metodo.id === selected.id;
            return (
              <button
                key={metodo.id}
                type="button"
                onClick={() => selectMetodo(metodo.id)}
                className={`relative flex min-h-20 items-center justify-center overflow-hidden rounded-2xl border bg-slate-100 text-xs font-extrabold uppercase transition sm:min-h-24 ${
                  isSelected
                    ? 'border-brand-600 opacity-100 shadow-lg shadow-brand-900/10 ring-2 ring-gold-300/30'
                    : 'border-slate-200 opacity-65 hover:opacity-100 dark:border-slate-700'
                }`}
                aria-label={`Elegir ${metodo.banco}`}
              >
                {metodo.logoUrl ? (
                  <Image src={metodo.logoUrl} alt={metodo.banco} fill sizes="96px" unoptimized className="object-cover" />
                ) : (
                  <span className="px-2 text-slate-700">{metodo.banco}</span>
                )}
                {isSelected && (
                  <span className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow">
                    <CheckIcon />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <h3 className="text-lg font-black text-slate-900 dark:text-gold-100">{selected.banco}</h3>
          <PaymentValue label="Nro de tarjeta" value={selected.numeroTarjeta} copied={copied} onCopy={copy} />
          <PaymentValue label="CLABE" value={selected.clabe} copied={copied} onCopy={copy} />

          <div className="mt-3">
            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Titular</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{selected.titular}</div>
          </div>
        </div>
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
      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <span className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2 text-lg font-black tracking-wide text-slate-900 shadow-sm dark:bg-slate-950/60 dark:text-white">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onCopy(label, value)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-900/10 transition hover:bg-brand-500"
          aria-label={`Copiar ${label}`}
        >
          {copied === label ? 'OK' : <CopyIcon />}
        </button>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
