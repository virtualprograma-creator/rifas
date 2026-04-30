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
    <form onSubmit={handleSubmit} className="rounded-2xl bg-[#079b89] p-5 text-white shadow-sm">
      <div className="mb-4 flex items-center justify-center gap-2 text-lg font-extrabold uppercase">
        <span aria-hidden="true">[+]</span>
        Enviar comprobante
      </div>

      <label className="mx-auto flex min-h-32 max-w-44 cursor-pointer flex-col items-center justify-center rounded-xl bg-white px-4 py-5 text-center text-sm font-semibold text-slate-500 transition hover:bg-slate-50">
        <span className="mb-2 text-3xl text-slate-400">Upload</span>
        <span>{file ? file.name : 'Subir archivo'}</span>
        <input
          type="file"
          accept="image/*,.pdf"
          className="sr-only"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>

      <p className="mt-4 text-center text-sm text-white/90">
        Envia una imagen, captura o PDF de tu comprobante para validar tu participacion.
      </p>

      {comprobanteUrl && (
        <a
          href={comprobanteUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block text-center text-sm font-bold underline"
        >
          Ver comprobante enviado
        </a>
      )}

      {error && <div className="mt-4 rounded-xl bg-red-950/30 px-3 py-2 text-sm">{error}</div>}
      {success && <div className="mt-4 rounded-xl bg-white/15 px-3 py-2 text-sm">{success}</div>}
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
