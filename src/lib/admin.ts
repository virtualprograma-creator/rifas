import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function requireAdmin() {
  const session = await getSession();

  if (!session || session.user.rol !== 'ADMIN') {
    return {
      session: null,
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
    };
  }

  return { session, response: null };
}

export function getErrorMessage(error: unknown, fallback = 'Error interno del servidor') {
  return error instanceof Error ? error.message : fallback;
}
