import { prisma } from './prisma';

export async function getWhatsAppNumber() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'whatsapp_number' }
    });
    if (setting?.value) {
      const digits = setting.value.replace(/\D/g, '');
      return digits.length === 10 ? `52${digits}` : digits;
    }
  } catch (error) {
    console.error('Error fetching whatsapp setting from database:', error);
  }
  const configuredNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER || '7441351057';
  const digits = configuredNumber.replace(/\D/g, '');
  return digits.length === 10 ? `52${digits}` : digits;
}

export async function generateWhatsAppMessage(data: {
  nombre: string;
  telefono: string;
  ciudad: string;
  estado: string;
  rifaTitulo: string;
  boletos: string[];
  total: number;
  folio?: string;
  ordenUrl?: string;
  banco?: string;
}) {
  const mensaje = `Hola! Vengo a confirmar mi apartado de boletos.

*Rifa:* ${data.rifaTitulo}
*Cliente:* ${data.nombre}
*Telefono:* ${data.telefono}
*Ubicacion:* ${data.ciudad}, ${data.estado}

*Boletos Apartados (${data.boletos.length}):*
${data.boletos.join(', ')}
${data.folio ? `\n*Folio:* ${data.folio}` : ''}
${data.banco ? `\n*Banco elegido:* ${data.banco}` : ''}

*Total a Pagar:* $${data.total}
*Fecha:* ${new Date().toLocaleString('es-MX')}
${data.ordenUrl ? `\n*Ver boletos:* ${data.ordenUrl}` : ''}

Por favor, indiquenme los metodos de pago. Gracias!`;

  const number = await getWhatsAppNumber();
  return `https://wa.me/${number}?text=${encodeURIComponent(mensaje)}`;
}

export async function generateAdminComprobanteMessage(data: {
  folio: string;
  cliente: string;
  rifaTitulo: string;
  boletos: string[];
  total: number;
  ordenUrl: string;
}) {
  const mensaje = `Comprobante recibido para validar.

*Folio:* ${data.folio}
*Cliente:* ${data.cliente}
*Rifa:* ${data.rifaTitulo}
*Boletos:* ${data.boletos.join(', ')}
*Total:* $${data.total}
*Orden:* ${data.ordenUrl}`;

  const number = await getWhatsAppNumber();
  return `https://wa.me/${number}?text=${encodeURIComponent(mensaje)}`;
}
