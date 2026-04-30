import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getErrorMessage, requireAdmin } from '@/lib/admin';
import { logAdminAction } from '@/lib/audit';

type CreateAdminBody = {
  nombre?: string;
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = (await req.json()) as CreateAdminBody;

    if (!body.nombre || !body.email || !body.password || body.password.length < 6) {
      return NextResponse.json({ error: 'Nombre, correo y contraseña de 6 caracteres son obligatorios' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const admin = await prisma.admin.create({
      data: {
        nombre: body.nombre.trim(),
        email: body.email.trim().toLowerCase(),
        passwordHash,
      },
    });

    await logAdminAction({
      action: 'CREATE_ADMIN',
      entityType: 'ADMIN',
      entityId: admin.id,
      summary: `Creo el administrador ${admin.nombre} (${admin.email})`,
      metadata: { email: admin.email, nombre: admin.nombre },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
