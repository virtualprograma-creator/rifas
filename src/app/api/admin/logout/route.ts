import { NextResponse } from 'next/server';
import { logAdminAction } from '@/lib/audit';

export async function POST() {
  await logAdminAction({
    action: 'LOGOUT',
    entityType: 'ADMIN',
    summary: 'Cierre de sesion',
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: 'session',
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
