'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function ComprobanteUploadForm({
  ordenId,
  comprobanteUrl,
}: {
  ordenId: string;
  comprobanteUrl?: string | null;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminWhatsappUrl, setAdminWhatsappUrl] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setError('Selecciona una imagen o PDF del comprobante.');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setSuccess('');
      setAdminWhatsappUrl('');

      const formData = new FormData();
      formData.append('comprobante', file);

      const response = await fetch(`/api/ordenes/${ordenId}/comprobante`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo subir el comprobante');
      }

      setSuccess('Comprobante enviado correctamente.');
      setAdminWhatsappUrl(data.adminWhatsappUrl || '');
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el comprobante');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-[#079b89] p-5 text-white shadow-lg shadow-teal-900/10">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/75">Paso 2</p>
        <h2 className="mt-1 text-xl font-black">Enviar comprobante</h2>
      </div>

      <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/50 bg-white/10 px-4 py-5 text-center text-sm font-semibold text-white transition hover:bg-white/15">
        <UploadIcon />
        <span className="mt-3 max-w-full truncate">{file ? file.name : 'Seleccionar imagen o PDF'}</span>
        <span className="mt-1 text-xs font-medium text-white/75">Captura, foto o documento PDF</span>
        <input
          type="file"
          accept="image/*,.pdf"
          className="sr-only"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>

      <p className="mt-4 text-sm text-white/90">
        Envía una imagen, captura o PDF de tu comprobante para validar tu participación.
      </p>

      {comprobanteUrl && (
        <a
          href={comprobanteUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block rounded-xl bg-white/10 px-3 py-2 text-center text-sm font-bold underline-offset-4 hover:bg-white/15 hover:underline"
        >
          Ver comprobante enviado
        </a>
      )}

      {error && <div className="mt-4 rounded-xl bg-red-950/30 px-3 py-2 text-sm font-semibold">{error}</div>}
      {success && <div className="mt-4 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold">{success}</div>}
      {adminWhatsappUrl && (
        <a
          href={adminWhatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block rounded-xl bg-white/15 px-3 py-2 text-center text-sm font-bold hover:bg-white/20"
        >
          Notificar al admin por WhatsApp
        </a>
      )}

      <button
        type="submit"
        disabled={isUploading}
        className="mt-5 min-h-11 w-full rounded-xl bg-white px-4 font-extrabold uppercase text-[#087f72] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isUploading ? 'Subiendo...' : 'Enviar comprobante'}
      </button>
    </form>
  );
}

function UploadIcon() {
  return (
    <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14" />
    </svg>
  );
}
