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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-3 block w-full rounded-xl bg-white/10 px-3 py-2 text-center text-sm font-bold hover:bg-white/15 active:scale-[0.98] transition-all"
          >
            Ver comprobante enviado
          </button>

          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" 
                onClick={() => setIsModalOpen(false)} 
              />

              {/* Modal content */}
              <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#101923] text-slate-900 dark:text-white">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <h4 className="flex items-center gap-2 text-base font-bold">
                    <svg className="h-5 w-5 text-[#079b89]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6a1 1 0 01.7.3l5.4 5.4a1 1 0 01.3.7V19a2 2 0 01-2 2z" />
                    </svg>
                    Comprobante enviado
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:bg-white/5"
                    aria-label="Cerrar"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex max-h-[60vh] items-center justify-center overflow-auto rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-slate-900 dark:bg-slate-950/50">
                  {comprobanteUrl.toLowerCase().endsWith('.pdf') || comprobanteUrl.startsWith('data:application/pdf') ? (
                    <iframe src={comprobanteUrl} className="h-[55vh] w-full rounded-lg border-0" title="Comprobante PDF" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={comprobanteUrl} 
                      alt="Comprobante enviado" 
                      className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-sm" 
                    />
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {comprobanteUrl.toLowerCase().endsWith('.pdf') || comprobanteUrl.startsWith('data:application/pdf') ? 'Formato: PDF' : 'Formato: Imagen'}
                  </span>
                  <div className="flex gap-2">
                    <a
                      href={comprobanteUrl}
                      download="comprobante"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descargar
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
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
