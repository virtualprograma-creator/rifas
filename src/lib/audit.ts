import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type AuditInput = {
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: unknown;
  actorType?: 'ADMIN' | 'CLIENTE' | 'SYSTEM';
  adminEmail?: string | null;
  adminNombre?: string | null;
};

export async function getCurrentAdminIdentity() {
  const session = await getSession();
  const email = session?.user.email || null;

  if (!email) {
    return { email: null, nombre: null };
  }

  const admin = await prisma.admin.findUnique({
    where: { email },
    select: { nombre: true, email: true },
  });

  return {
    email,
    nombre: admin?.nombre || (email === (process.env.ADMIN_EMAIL || '').toLowerCase() ? 'Administrador principal' : null),
  };
}

export async function logAudit(input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        actorType: input.actorType || 'ADMIN',
        adminEmail: input.adminEmail || null,
        adminNombre: input.adminNombre || null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || null,
        summary: input.summary,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  } catch (error) {
    console.error('Error registrando auditoria:', error);
  }
}

export async function logAdminAction(input: Omit<AuditInput, 'actorType' | 'adminEmail' | 'adminNombre'>) {
  const admin = await getCurrentAdminIdentity();
  await logAudit({
    ...input,
    actorType: 'ADMIN',
    adminEmail: admin.email,
    adminNombre: admin.nombre,
  });
}

export async function logSystemAction(input: Omit<AuditInput, 'actorType'>) {
  await logAudit({ ...input, actorType: 'SYSTEM' });
}
