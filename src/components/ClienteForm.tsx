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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center text-slate-500 border border-slate-200 dark:border-slate-700">
        <p>Selecciona al menos un boleto para continuar con el apartado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
      <div className="bg-brand-50 dark:bg-brand-900/20 p-6 border-b border-brand-100 dark:border-brand-900/50">
        <h3 className="text-xl font-bold text-brand-900 dark:text-brand-100 mb-2">Resumen de tu apartado</h3>
        
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-600 dark:text-slate-400">Boletos ({boletosSeleccionados.length}):</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {boletosSeleccionados.map(b => b.numeroFormateado).join(', ')}
          </span>
        </div>
        
        <div className="flex justify-between text-sm mb-3">
          <span className="text-slate-600 dark:text-slate-400">Precio por boleto:</span>
          <span className="font-medium text-slate-900 dark:text-white">${precioBoleto.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-end border-t border-brand-200 dark:border-brand-800/50 pt-3 mt-3">
          <span className="text-brand-700 dark:text-brand-300 font-semibold">Total a pagar:</span>
          <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">${total.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Tus datos para el apartado</h4>
        
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre Completo *</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            required
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            placeholder="Juan Pérez"
          />
        </div>

        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono (WhatsApp) *</label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            required
            value={formData.telefono}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            placeholder="1234567890"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="ciudad" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ciudad *</label>
            <input
              type="text"
              id="ciudad"
              name="ciudad"
              required
              value={formData.ciudad}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            />
          </div>
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado *</label>
            <input
              type="text"
              id="estado"
              name="estado"
              required
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="correo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico (Opcional)</label>
          <input
            type="email"
            id="correo"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            placeholder="juan@ejemplo.com"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 flex items-center justify-center rounded-xl text-white font-bold text-lg shadow-lg shadow-brand-500/30 transition-all ${
              isLoading ? 'bg-brand-400 cursor-wait' : 'bg-brand-600 hover:bg-brand-500 hover:-translate-y-1'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : (
              'Apartar boletos'
            )}
          </button>
        </div>
      </form>

      {isConfirming && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-900/70 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#0b2419]">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-gold-100 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
              Confirma tus datos
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Por favor, verifica que todos tus datos sean correctos antes de apartar los boletos.
            </p>
            
            <div className="space-y-3 mb-6 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
              <div className="flex justify-between">
                <span className="text-slate-500">Boletos:</span>
                <span className="font-bold text-brand-700 dark:text-gold-300">
                  {boletosSeleccionados.map(b => b.numeroFormateado).join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nombre:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Teléfono:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.telefono}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ubicación:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.ciudad}, {formData.estado}</span>
              </div>
              {formData.correo && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Correo:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.correo}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Total a pagar:</span>
                <span className="font-bold text-brand-600 dark:text-brand-400 text-base">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                disabled={isLoading}
              >
                Corregir datos
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-colors shadow-lg shadow-brand-500/30"
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : 'Sí, Apartar Boletos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
