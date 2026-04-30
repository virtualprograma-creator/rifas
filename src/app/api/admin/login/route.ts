import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const envEmail = process.env.ADMIN_EMAIL || 'admin@ejemplo.com';
    const envPassword = process.env.ADMIN_PASSWORD || 'admin';

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    const validDbAdmin = admin ? await bcrypt.compare(password, admin.passwordHash) : false;
    const validEnvAdmin = normalizedEmail === envEmail.toLowerCase() && password === envPassword;

    if (validDbAdmin || validEnvAdmin) {
      await logAudit({
        actorType: 'ADMIN',
        adminEmail: normalizedEmail,
        adminNombre: admin?.nombre || 'Administrador principal',
        action: 'LOGIN',
        entityType: 'ADMIN',
        entityId: admin?.id || normalizedEmail,
        summary: `Inicio de sesion de ${admin?.nombre || normalizedEmail}`,
      });

      // Create session
      const sessionData = { user: { email: normalizedEmail, rol: 'ADMIN' } };
      const token = await encrypt(sessionData);

      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: 'session',
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });

      return response;
    }

    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
