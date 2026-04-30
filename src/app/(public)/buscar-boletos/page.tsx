import { BoletoSearch } from '@/components/BoletoSearch';

export const metadata = {
  title: 'Buscar boletos',
};

export default function BuscarBoletosPage() {
  return (
    <main className="min-h-screen bg-[#f4f7f1] px-4 py-10 dark:bg-[#071710]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-600 dark:text-gold-300">
            Consulta de boletos
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-brand-900 dark:text-gold-100 sm:text-4xl">
            Buscar boletos
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
            Ingresa el numero de boleto para revisar en que rifa participa y su estado actual.
          </p>
        </div>

        <BoletoSearch />
      </div>
    </main>
  );
}
