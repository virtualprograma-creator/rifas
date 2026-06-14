'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface RifaEditFormProps {
  rifa: {
    id: string;
    titulo: string;
    categoria: string;
    descripcionCorta: string;
    descripcionCompleta: string;
    imagenUrl: string;
    precioBoleto: number;
    ocultarEstadisticasPublicas: boolean;
    fechaSorteo: Date;
    estado: string;
    razonEstado: string | null;
    metodosPago: MetodoPagoFormData[];
  };
}

type MetodoPagoFormData = {
  id?: string;
  banco: string;
  logoUrl: string | null;
  titular: string;
  numeroTarjeta: string | null;
  clabe: string | null;
};

function toDateTimeLocal(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function RifaEditForm({ rifa }: RifaEditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    titulo: rifa.titulo,
    categoria: rifa.categoria,
    descripcionCorta: rifa.descripcionCorta,
    descripcionCompleta: rifa.descripcionCompleta,
    imagenUrl: rifa.imagenUrl,
    precioBoleto: rifa.precioBoleto.toString(),
    ocultarEstadisticasPublicas: rifa.ocultarEstadisticasPublicas,
    fechaSorteo: toDateTimeLocal(new Date(rifa.fechaSorteo)),
    estado: rifa.estado,
    razonEstado: rifa.razonEstado || '',
  });
  const [metodosPago, setMetodosPago] = useState<MetodoPagoFormData[]>(
    rifa.metodosPago.length
      ? rifa.metodosPago.map((metodo) => ({
          id: metodo.id,
          banco: metodo.banco,
          logoUrl: metodo.logoUrl || '',
          titular: metodo.titular,
          numeroTarjeta: metodo.numeroTarjeta || '',
          clabe: metodo.clabe || '',
        }))
      : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
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

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const response = await fetch(`/api/admin/rifas/${rifa.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, metodosPago }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || 'No se pudo actualizar la rifa');
      return;
    }

    router.refresh();
  };

  const updateRifaStatus = async (estado: string, razonEstado = '') => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/rifas/${rifa.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, razonEstado }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'No se pudo actualizar la rifa');
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setError('Ocurrio un error al intentar actualizar la rifa');
      setLoading(false);
    }
  };

  const deleteRifa = async () => {
    const razon = window.prompt('Motivo para eliminar/ocultar esta rifa. Podras restaurarla despues.');
    if (razon === null) return;
    await updateRifaStatus('CANCELADA', razon || 'Rifa eliminada temporalmente');
  };

  const restoreRifa = async () => {
    if (!window.confirm('Deseas restaurar esta rifa y volverla activa?')) return;
    await updateRifaStatus('ACTIVA');
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
    >
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Editar rifa</h3>
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="Titulo" name="titulo" value={formData.titulo} onChange={handleChange} required />
        <Input label="Categoria" name="categoria" value={formData.categoria} onChange={handleChange} />
        <Input
          label="Precio"
          name="precioBoleto"
          type="number"
          step="0.01"
          value={formData.precioBoleto}
          onChange={handleChange}
          required
        />
        <Input
          label="Fecha de la rifa"
          name="fechaSorteo"
          type="datetime-local"
          value={formData.fechaSorteo}
          onChange={handleChange}
          required
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >
            <option value="ACTIVA">Activa</option>
            <option value="PAUSADA">Pausada</option>
            <option value="CANCELADA">Eliminada</option>
            <option value="FINALIZADA">Finalizada</option>
          </select>
        </div>
        <Input label="URL de imagen" name="imagenUrl" type="url" value={formData.imagenUrl} onChange={handleChange} />
      </div>

      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
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

      {formData.estado !== 'ACTIVA' && (
        <Input
          label={`Motivo de ${
            formData.estado === 'FINALIZADA'
              ? 'finalizacion'
              : formData.estado === 'CANCELADA'
                ? 'eliminacion'
                : formData.estado.toLowerCase()
          }`}
          name="razonEstado"
          value={formData.razonEstado}
          onChange={handleChange}
          placeholder="Ej: Rifa reprogramada por mantenimiento..."
        />
      )}

      <Input
        label="Descripcion corta"
        name="descripcionCorta"
        value={formData.descripcionCorta}
        onChange={handleChange}
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Descripcion completa
        </label>
        <textarea
          name="descripcionCompleta"
          value={formData.descripcionCompleta}
          onChange={handleChange}
          rows={5}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Metodos de pago</h4>
            <p className="text-sm text-slate-500">Estos bancos apareceran en la pantalla de pago de esta rifa.</p>
          </div>
          <button
            type="button"
            onClick={addMetodoPago}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500"
          >
            Agregar banco
          </button>
        </div>

        <div className="space-y-4">
          {metodosPago.map((metodo, index) => (
            <div key={metodo.id || index} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="font-semibold text-slate-700 dark:text-slate-200">Banco {index + 1}</div>
                <button
                  type="button"
                  onClick={() => removeMetodoPago(index)}
                  className="text-sm font-semibold text-red-600 hover:text-red-500"
                >
                  Quitar
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Banco"
                  value={metodo.banco}
                  onChange={(event) => updateMetodoPago(index, 'banco', event.target.value)}
                  placeholder="BBVA Bancomer"
                />
                <Input
                  label="Logo URL"
                  type="url"
                  value={metodo.logoUrl || ''}
                  onChange={(event) => updateMetodoPago(index, 'logoUrl', event.target.value)}
                  placeholder="https://..."
                />
                <Input
                  label="Titular"
                  value={metodo.titular}
                  onChange={(event) => updateMetodoPago(index, 'titular', event.target.value)}
                  placeholder="Nombre del titular"
                />
                <Input
                  label="Numero de tarjeta"
                  value={metodo.numeroTarjeta || ''}
                  onChange={(event) => updateMetodoPago(index, 'numeroTarjeta', event.target.value)}
                  placeholder="0000000000000000"
                />
                <Input
                  label="CLABE interbancaria"
                  value={metodo.clabe || ''}
                  onChange={(event) => updateMetodoPago(index, 'clabe', event.target.value)}
                  placeholder="000000000000000000"
                />
              </div>
            </div>
          ))}

          {metodosPago.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 dark:border-slate-700">
              Aun no hay bancos configurados para esta rifa.
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 dark:border-slate-700 sm:flex-row">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-500 disabled:opacity-60"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>

        {rifa.estado === 'CANCELADA' ? (
          <button
            type="button"
            onClick={restoreRifa}
            disabled={loading}
            className="rounded-xl border-2 border-green-200 px-6 py-3 font-bold text-green-700 transition-colors hover:bg-green-50 disabled:opacity-60 dark:border-green-900/30 dark:text-green-400 dark:hover:bg-green-900/20"
          >
            {loading ? 'Restaurando...' : 'Restaurar rifa'}
          </button>
        ) : (
          <button
            type="button"
            onClick={deleteRifa}
            disabled={loading}
            className="rounded-xl border-2 border-red-200 px-6 py-3 font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {loading ? 'Eliminando...' : 'Eliminar rifa'}
          </button>
        )}
      </div>
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
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
      />
    </div>
  );
}
