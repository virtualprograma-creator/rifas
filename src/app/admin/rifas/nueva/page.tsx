'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/AdminLayout';

type MetodoPagoFormData = {
  banco: string;
  logoUrl: string;
  titular: string;
  numeroTarjeta: string;
  clabe: string;
};

export default function NuevaRifa() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metodosPago, setMetodosPago] = useState<MetodoPagoFormData[]>([]);

  const [formData, setFormData] = useState({
    titulo: '',
    categoria: '',
    descripcionCorta: '',
    descripcionCompleta: '',
    imagenUrl: '',
    precioBoleto: '',
    cantidadBoletos: '5000',
    ocultarEstadisticasPublicas: false,
    fechaSorteo: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const addMetodoPago = () => {
    setMetodosPago((prev) => [
      ...prev,
      {
        banco: '',
        logoUrl: '',
        titular: '',
        numeroTarjeta: '',
        clabe: '',
      },
    ]);
  };

  const updateMetodoPago = (index: number, field: keyof MetodoPagoFormData, value: string) => {
    setMetodosPago((prev) =>
      prev.map((metodo, currentIndex) => (currentIndex === index ? { ...metodo, [field]: value } : metodo))
    );
  };

  const removeMetodoPago = (index: number) => {
    setMetodosPago((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/rifas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, metodosPago }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Error al crear la rifa');
      }
    } catch {
      setError('Ocurrio un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-4">
          Crear Nueva Rifa
        </h2>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Titulo de la Rifa *" required name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ej. iPhone 15 Pro Max" className="md:col-span-2" />
            <Input label="Categoria" name="categoria" value={formData.categoria} onChange={handleChange} placeholder="Ej. Electronica" />
            <Input label="URL de Imagen" type="url" name="imagenUrl" value={formData.imagenUrl} onChange={handleChange} placeholder="https://..." />
            <Input label="Precio del Boleto ($) *" required type="number" step="0.01" name="precioBoleto" value={formData.precioBoleto} onChange={handleChange} placeholder="50.00" />

            <div>
              <Input label="Cantidad de Boletos *" required type="number" name="cantidadBoletos" value={formData.cantidadBoletos} onChange={handleChange} placeholder="5000" />
              <p className="text-xs text-slate-500 mt-1">Se generaran automaticamente desde el 0001 hasta esta cantidad.</p>
            </div>

            <Input label="Fecha del Sorteo *" required type="datetime-local" name="fechaSorteo" value={formData.fechaSorteo} onChange={handleChange} className="md:col-span-2" />
            <Input label="Descripcion Corta" name="descripcionCorta" value={formData.descripcionCorta} onChange={handleChange} maxLength={150} className="md:col-span-2" />

            <label className="md:col-span-2 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
              <input
                type="checkbox"
                name="ocultarEstadisticasPublicas"
                checked={formData.ocultarEstadisticasPublicas}
                onChange={handleCheckboxChange}
                className="mt-1 h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>
                <span className="block font-bold text-slate-800 dark:text-slate-100">Ocultar vendidos y disponibles</span>
                <span className="mt-1 block text-sm text-slate-500">
                  En la página pública solo se mostrará precio y cantidad total de boletos.
                </span>
              </span>
            </label>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Descripcion Completa</label>
              <textarea
                name="descripcionCompleta"
                value={formData.descripcionCompleta}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <section className="md:col-span-2 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">Metodos de pago</h3>
                  <p className="text-sm text-slate-500">Estos bancos apareceran en la pantalla de pago.</p>
                </div>
                <button type="button" onClick={addMetodoPago} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500">
                  Agregar banco
                </button>
              </div>

              <div className="space-y-4">
                {metodosPago.map((metodo, index) => (
                  <div key={index} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-700 dark:text-slate-200">Banco {index + 1}</div>
                      <button type="button" onClick={() => removeMetodoPago(index)} className="text-sm font-semibold text-red-600 hover:text-red-500">
                        Quitar
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input label="Banco" value={metodo.banco} onChange={(event) => updateMetodoPago(index, 'banco', event.target.value)} placeholder="BBVA Bancomer" />
                      <Input label="Logo URL" type="url" value={metodo.logoUrl} onChange={(event) => updateMetodoPago(index, 'logoUrl', event.target.value)} placeholder="https://..." />
                      <Input label="Titular" value={metodo.titular} onChange={(event) => updateMetodoPago(index, 'titular', event.target.value)} placeholder="Nombre del titular" />
                      <Input label="Numero de tarjeta" value={metodo.numeroTarjeta} onChange={(event) => updateMetodoPago(index, 'numeroTarjeta', event.target.value)} placeholder="0000000000000000" />
                      <Input label="CLABE interbancaria" value={metodo.clabe} onChange={(event) => updateMetodoPago(index, 'clabe', event.target.value)} placeholder="000000000000000000" />
                    </div>
                  </div>
                ))}

                {metodosPago.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 dark:border-slate-700">
                    Aun no hay bancos configurados para esta rifa.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-4">
            <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors disabled:opacity-70">
              {loading ? 'Generando Boletos...' : 'Crear Rifa'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

function Input({
  label,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
      />
    </div>
  );
}
