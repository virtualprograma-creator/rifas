'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDbError = error.message.includes('Can\'t reach database server') || error.message.includes('PrismaClientInitializationError');

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-lg w-full border border-slate-100 dark:border-slate-700">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          {isDbError ? 'Falta conectar la base de datos' : 'Algo salió mal'}
        </h2>
        
        <div className="text-slate-600 dark:text-slate-400 mb-8 space-y-4 text-sm md:text-base">
          {isDbError ? (
            <>
              <p>El sistema está intentando cargar la información, pero no se ha configurado una base de datos activa.</p>
              <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl text-left border border-slate-200 dark:border-slate-700 font-mono text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">Pasos para solucionar:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Abre <span className="text-brand-500">.env.local</span></li>
                  <li>Pon tu URL de Neon en <span className="text-brand-500">DATABASE_URL</span></li>
                  <li>Corre en terminal: <span className="text-brand-500">npx prisma db push</span></li>
                </ol>
              </div>
            </>
          ) : (
            <p>{error.message}</p>
          )}
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20"
          >
            Intentar de nuevo
          </button>
          {isDbError && (
            <Link 
              href="/admin/login"
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl font-bold transition-all"
            >
              Ir a Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
