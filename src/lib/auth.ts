import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.NEXTAUTH_SECRET || 'secret123';
const key = new TextEncoder().encode(secretKey);

export type SessionPayload = JWTPayload & {
  user: {
    email: string;
    rol: string;
  };
};

export async function encrypt(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key);
}

export async function decrypt(input: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  try {
    const payload = await decrypt(session);
    if (
      typeof payload.user === 'object' &&
      payload.user !== null &&
      'email' in payload.user &&
      'rol' in payload.user
    ) {
      return payload as SessionPayload;
    }
    return null;
  } catch {
    return null;
  }
}
