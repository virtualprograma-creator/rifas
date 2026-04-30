import { NextResponse } from 'next/server';
import { getErrorMessage, requireAdmin } from '@/lib/admin';
import { liberarOrdenesVencidas } from '@/lib/orders';
import { logAdminAction } from '@/lib/audit';

export async function POST() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const liberadas = await liberarOrdenesVencidas();
    await logAdminAction({
      action: 'EXPIRE_ORDERS',
      entityType: 'ORDEN',
      summary: `Libero ${liberadas} orden(es) vencidas`,
      metadata: { liberadas },
    });
    return NextResponse.json({ success: true, liberadas });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
