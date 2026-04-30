'use client';

import React from 'react';
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
    // Dimensiones para tickera (80mm de ancho)
    // En jsPDF, 'mm' es la unidad. El alto es dinámico pero empezamos con algo razonable.
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 150], // 80mm x 150mm
    });

    const margin = 5;
    const width = 80;
    let y = 10;

    // Estilos de fuente
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    
    // Header
    doc.text('interRIFAS', width / 2, y, { align: 'center' });
    y += 7;
    
    doc.setFontSize(10);
    doc.text(orden.rifa.titulo, width / 2, y, { align: 'center' });
    y += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const dateStr = new Date(orden.createdAt).toLocaleString('es-MX');
    doc.text(dateStr, width / 2, y, { align: 'center' });
    y += 5;

    // Separador
    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, y, width - margin, y);
    y += 5;

    // Info Cliente
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

    // Separador
    doc.line(margin, y, width - margin, y);
    y += 5;

    // Boletos
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('BOLETOS:', margin, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const boletosStr = orden.boletos.map(b => b.numeroFormateado).join(', ');
    
    // Ajustar texto largo de boletos
    const splitBoletos = doc.splitTextToSize(boletosStr, width - (margin * 2));
    doc.text(splitBoletos, margin, y);
    y += (splitBoletos.length * 5);

    // Separador
    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, y, width - margin, y);
    y += 5;

    // Total y Estado
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', margin, y);
    doc.text(`$${orden.total.toFixed(2)}`, width - margin, y, { align: 'right' });
    y += 5;

    doc.text('ESTADO:', margin, y);
    doc.text(orden.estado, width - margin, y, { align: 'right' });
    y += 7;

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('¡Gracias por participar y mucha suerte!', width / 2, y, { align: 'center' });

    // Guardar
    doc.save(`boleto-${orden.folio || orden.id.substring(0, 8)}.pdf`);
  };

  if (variant === 'admin') {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          downloadTicket();
        }}
        className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-500 font-medium text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Imprimir
      </button>
    );
  }

  return (
    <button
      onClick={downloadTicket}
      className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#079b89] bg-white px-5 font-extrabold uppercase text-[#079b89] transition hover:bg-teal-50"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Descargar Boletos (PDF)
    </button>
  );
}
