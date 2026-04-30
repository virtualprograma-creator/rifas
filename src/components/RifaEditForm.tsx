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

  const deleteRifa = async () => {
    if (
      !window.confirm(
        '¿ESTÁS TOTALMENTE SEGURO? Esta acción es irreversible y borrará TODOS los boletos y órdenes de esta rifa del sistema.'
      )
    ) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/rifas/${rifa.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'No se pudo eliminar la rifa');
        setLoading(false);
        return;
      }

      router.push('/admin/rifas');
      router.refresh();
    } catch (err) {
      setError('Ocurrió un error al intentar eliminar la rifa');
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-5"
    >
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Editar rifa</h3>
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ACTIVA">Activa</option>
            <option value="PAUSADA">Pausada</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="FINALIZADA">Finalizada</option>
          </select>
        </div>
        <Input label="URL de imagen" name="imagenUrl" type="url" value={formData.imagenUrl} onChange={handleChange} />
      </div>

      {formData.estado !== 'ACTIVA' && (
        <Input
          label={`Motivo de ${formData.estado === 'FINALIZADA' ? 'finalización' : formData.estado.toLowerCase()}`}
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
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Descripcion completa
        </label>
        <textarea
          name="descripcionCompleta"
          value={formData.descripcionCompleta}
          onChange={handleChange}
          rows={5}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
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

      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-500 disabled:opacity-60"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={deleteRifa}
          disabled={loading}
          className="rounded-xl border-2 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 px-6 py-3 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Borrando...' : 'Eliminar Rifa'}
        </button>
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
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
      />
    </div>
  );
}
