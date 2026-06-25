'use client';

import Image from 'next/image';
import { useState } from 'react';

type AdminComprobanteViewerProps = {
  comprobanteUrl: string | null;
  notasPago: string | null;
};

export function AdminComprobanteViewer({ comprobanteUrl, notasPago }: AdminComprobanteViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!comprobanteUrl) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">No hay comprobante registrado.</p>
        {notasPago && <p className="text-sm font-medium italic text-slate-600 dark:text-slate-400">{notasPago}</p>}
      </div>
    );
  }

  const isPdf = comprobanteUrl.toLowerCase().endsWith('.pdf') || comprobanteUrl.startsWith('data:application/pdf');

  return (
    <>
      <div className="space-y-3">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500/10 px-4 py-2 text-sm font-bold text-brand-600 transition-all hover:bg-brand-500/20 active:scale-[0.98] dark:text-brand-400"
        >
          <EyeIcon />
          Abrir comprobante
        </button>
        {notasPago && <p className="text-sm text-slate-600 dark:text-slate-400">{notasPago}</p>}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#101923]">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h4 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <DocumentIcon />
                Comprobante de pago
              </h4>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
                aria-label="Cerrar"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex max-h-[65vh] items-center justify-center overflow-auto rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-slate-900 dark:bg-slate-950/50">
              {isPdf ? (
                <iframe src={comprobanteUrl} className="h-[60vh] w-full rounded-lg border-0" title="Comprobante PDF" />
              ) : (
                <div className="relative h-[60vh] w-full">
                  <Image src={comprobanteUrl} alt="Comprobante de pago" fill sizes="80vw" unoptimized className="object-contain" />
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isPdf ? 'Formato: PDF' : 'Formato: Imagen'}
              </div>
              <div className="flex gap-2">
                <a
                  href={comprobanteUrl}
                  download
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  <DownloadIcon />
                  Descargar
                </a>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-500"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EyeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 12C3.7 7.9 7.5 5 12 5s8.3 2.9 9.5 7c-1.2 4.1-5 7-9.5 7s-8.3-2.9-9.5-7z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6a1 1 0 01.7.3l5.4 5.4a1 1 0 01.3.7V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
