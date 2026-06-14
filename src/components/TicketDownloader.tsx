'use client';

import { jsPDF } from 'jspdf';

interface TicketDownloaderProps {
  orden: {
    id: string;
    folio: string | null;
    total: number;
    estado: string;
    createdAt: Date | string;
    cliente: {
      nombre: string;
      telefono: string;
    };
    rifa: {
      titulo: string;
    };
    boletos: {
      numeroFormateado: string;
    }[];
  };
  variant?: 'public' | 'admin';
}

export function TicketDownloader({ orden, variant = 'public' }: TicketDownloaderProps) {
  const downloadTicket = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 150],
    });

    const margin = 5;
    const width = 80;
    let y = 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('interRIFAS', width / 2, y, { align: 'center' });
    y += 7;

    doc.setFontSize(10);
    doc.text(orden.rifa.titulo, width / 2, y, { align: 'center' });
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(new Date(orden.createdAt).toLocaleString('es-MX'), width / 2, y, { align: 'center' });
    y += 5;

    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, y, width - margin, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(orden.cliente.nombre, margin + 15, y);
    y += 4;

    doc.setFont('helvetica', 'bold');
    doc.text('TEL:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(orden.cliente.telefono, margin + 15, y);
    y += 4;

    doc.setFont('helvetica', 'bold');
    doc.text('FOLIO:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(orden.folio || orden.id.substring(0, 8).toUpperCase(), margin + 15, y);
    y += 5;

    doc.line(margin, y, width - margin, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('BOLETOS:', margin, y);
    y += 5;

    doc.setFontSize(12);
    const boletosStr = orden.boletos.map((boleto) => boleto.numeroFormateado).join(', ');
    const splitBoletos = doc.splitTextToSize(boletosStr, width - margin * 2);
    doc.text(splitBoletos, margin, y);
    y += splitBoletos.length * 5;

    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, y, width - margin, y);
    y += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', margin, y);
    doc.text(`$${orden.total.toFixed(2)}`, width - margin, y, { align: 'right' });
    y += 5;

    doc.text('ESTADO:', margin, y);
    doc.text(orden.estado, width - margin, y, { align: 'right' });
    y += 7;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Gracias por participar y mucha suerte', width / 2, y, { align: 'center' });

    doc.save(`boleto-${orden.folio || orden.id.substring(0, 8)}.pdf`);
  };

  if (variant === 'admin') {
    return (
      <button
        onClick={(event) => {
          event.preventDefault();
          downloadTicket();
        }}
        className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-500"
      >
        <PrintIcon />
        Imprimir
      </button>
    );
  }

  return (
    <button
      onClick={downloadTicket}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#079b89] bg-white px-5 font-extrabold uppercase text-[#079b89] transition hover:bg-teal-50 active:scale-[0.98]"
    >
      <DownloadIcon />
      Descargar boletos (PDF)
    </button>
  );
}

function PrintIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6a1 1 0 01.7.3l5.4 5.4a1 1 0 01.3.7V19a2 2 0 01-2 2z" />
    </svg>
  );
}
