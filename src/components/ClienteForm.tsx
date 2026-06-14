'use client';

import { useState } from 'react';
import { BoletoType } from './BoletoGrid';

interface ClienteFormProps {
  boletosSeleccionados: BoletoType[];
  precioBoleto: number;
  onSubmit: (datos: ClienteFormData) => Promise<void>;
  isLoading: boolean;
}

export interface ClienteFormData {
  nombre: string;
  telefono: string;
  ciudad: string;
  estado: string;
  correo: string;
}

export function ClienteForm({ boletosSeleccionados, precioBoleto, onSubmit, isLoading }: ClienteFormProps) {
  const [formData, setFormData] = useState<ClienteFormData>({
    nombre: '',
    telefono: '',
    ciudad: '',
    estado: '',
    correo: '',
  });
  const [isConfirming, setIsConfirming] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (boletosSeleccionados.length === 0) return;
    setIsConfirming(true);
  };

  const handleConfirm = async () => {
    await onSubmit(formData);
    setIsConfirming(false);
  };

  const total = boletosSeleccionados.length * precioBoleto;

  if (boletosSeleccionados.length === 0) {
    return (
      <div className="premium-card rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-[#0b2419]">
        <div className="relative z-10">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            <TicketIcon />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Tu apartado</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Selecciona al menos un boleto para continuar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#0b2419]">
      <div className="relative z-10 border-b border-brand-100 bg-brand-50 p-6 dark:border-brand-900/50 dark:bg-brand-900/20">
        <h3 className="mb-2 text-xl font-black text-brand-900 dark:text-brand-100">Resumen de tu apartado</h3>

        <div className="mb-1 flex justify-between gap-3 text-sm">
          <span className="shrink-0 text-slate-600 dark:text-slate-400">Boletos ({boletosSeleccionados.length}):</span>
          <span className="text-right font-semibold text-slate-900 dark:text-white">
            {boletosSeleccionados.map((boleto) => boleto.numeroFormateado).join(', ')}
          </span>
        </div>

        <div className="mb-3 flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Precio por boleto:</span>
          <span className="font-semibold text-slate-900 dark:text-white">${precioBoleto.toFixed(2)}</span>
        </div>

        <div className="mt-3 flex items-end justify-between border-t border-brand-200 pt-3 dark:border-brand-800/50">
          <span className="font-semibold text-brand-700 dark:text-brand-300">Total a pagar:</span>
          <span className="text-2xl font-black text-brand-600 dark:text-brand-400">${total.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-4 p-6">
        <h4 className="mb-4 font-bold text-slate-800 dark:text-slate-200">Tus datos para el apartado</h4>

        <Field
          label="Nombre completo *"
          id="nombre"
          name="nombre"
          required
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Juan Pérez"
        />

        <Field
          label="Teléfono (WhatsApp) *"
          id="telefono"
          name="telefono"
          type="tel"
          required
          value={formData.telefono}
          onChange={handleChange}
          placeholder="1234567890"
        />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Ciudad *" id="ciudad" name="ciudad" required value={formData.ciudad} onChange={handleChange} />
          <Field label="Estado *" id="estado" name="estado" required value={formData.estado} onChange={handleChange} />
        </div>

        <Field
          label="Correo electrónico (opcional)"
          id="correo"
          name="correo"
          type="email"
          value={formData.correo}
          onChange={handleChange}
          placeholder="juan@ejemplo.com"
        />

        <button
          type="submit"
          disabled={isLoading}
          className={`flex w-full items-center justify-center rounded-xl px-4 py-3 text-lg font-bold text-white shadow-lg shadow-brand-500/30 transition-all ${
            isLoading ? 'cursor-wait bg-brand-400' : 'bg-brand-600 hover:-translate-y-0.5 hover:bg-brand-500'
          }`}
        >
          {isLoading ? <LoadingLabel text="Procesando..." /> : 'Apartar boletos'}
        </button>
      </form>

      {isConfirming && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-900/70 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#0b2419]">
            <h3 className="mb-4 border-b border-slate-100 pb-2 text-2xl font-bold text-slate-900 dark:border-slate-700 dark:text-gold-100">
              Confirma tus datos
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
              Verifica que todo sea correcto antes de apartar los boletos.
            </p>

            <div className="mb-6 space-y-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/50">
              <ConfirmRow label="Boletos" value={boletosSeleccionados.map((boleto) => boleto.numeroFormateado).join(', ')} strong />
              <ConfirmRow label="Nombre" value={formData.nombre} />
              <ConfirmRow label="Teléfono" value={formData.telefono} />
              <ConfirmRow label="Ubicación" value={`${formData.ciudad}, ${formData.estado}`} />
              {formData.correo && <ConfirmRow label="Correo" value={formData.correo} />}
              <div className="flex justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
                <span className="text-slate-500">Total a pagar:</span>
                <span className="text-base font-bold text-brand-600 dark:text-brand-400">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                className="flex-1 rounded-xl border border-slate-300 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-white/5"
                disabled={isLoading}
              >
                Corregir datos
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 rounded-xl bg-brand-600 py-3 font-bold text-white shadow-lg shadow-brand-500/30 transition-colors hover:bg-brand-500 disabled:opacity-60"
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : 'Sí, apartar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  id,
  name,
  type = 'text',
  required = false,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  id: string;
  name: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        placeholder={placeholder}
      />
    </div>
  );
}

function ConfirmRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-slate-500">{label}:</span>
      <span className={`text-right ${strong ? 'font-bold text-brand-700 dark:text-gold-300' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
        {value}
      </span>
    </div>
  );
}

function LoadingLabel({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-2">
      <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z" />
      </svg>
      {text}
    </span>
  );
}

function TicketIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}
