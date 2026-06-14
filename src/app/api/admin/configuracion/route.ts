import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getErrorMessage, requireAdmin } from '@/lib/admin';
import { logAdminAction } from '@/lib/audit';

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'whatsapp_number' },
    });
    const defaultNumber = process.env.WHATSAPP_NUMBER || '7441351057';
    return NextResponse.json({ whatsappNumber: setting?.value || defaultNumber });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await req.json();
    const { whatsappNumber } = body;

    if (!whatsappNumber) {
      return NextResponse.json({ error: 'El número de WhatsApp es obligatorio' }, { status: 400 });
    }

    const trimmedNumber = whatsappNumber.trim();

    const setting = await prisma.setting.upsert({
      where: { key: 'whatsapp_number' },
      update: { value: trimmedNumber },
      create: { key: 'whatsapp_number', value: trimmedNumber },
    });

    await logAdminAction({
      action: 'UPDATE_SETTING',
      entityType: 'SETTING',
      entityId: 'whatsapp_number',
      summary: `Actualizó el número de WhatsApp a ${trimmedNumber}`,
      metadata: { whatsappNumber: trimmedNumber },
    });

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
