import prisma from './db';
import { verifyToken, extractBearerToken } from './auth';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  agentId?: string;
}

/**
 * Authenticate request and return payload. Returns null on failure (caller sends 401/403).
 */
export function authenticate(request: NextRequest, allowedRoles?: string[]): { payload: AuthPayload | null; response: NextResponse | null } {
  const token = extractBearerToken(request.headers.get('authorization'));
  if (!token) return { payload: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const payload = verifyToken(token) as AuthPayload | null;
  if (!payload) return { payload: null, response: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };

  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    return { payload: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { payload, response: null };
}

/**
 * Build a Prisma where clause that enforces Sub-Agent isolation.
 * SUPER_ADMIN gets no filter. SUB_AGENT only sees users with their agentId.
 */
export function agentWhereFilter(payload: AuthPayload, fieldName: string = 'agentId'): Record<string, any> {
  if (payload.role === 'SUPER_ADMIN') return {};
  if (payload.role === 'SUB_AGENT') {
    return { [fieldName]: payload.userId };
  }
  return {};
}

/**
 * For routes where Sub-Agent should only see their OWN assigned customers (users where agentId = their ID),
 * plus themselves.
 */
export function customerWhereFilter(payload: AuthPayload): Record<string, any> {
  if (payload.role === 'SUPER_ADMIN') return {};
  if (payload.role === 'SUB_AGENT') {
    return {
      OR: [
        { agentId: payload.userId },
        { id: payload.userId },
      ],
    };
  }
  return {};
}

/**
 * Get the list of user IDs that a Sub-Agent is allowed to access.
 * Returns null for SUPER_ADMIN (meaning no restriction).
 */
export async function getAccessibleUserIds(payload: AuthPayload): Promise<string[] | null> {
  if (payload.role === 'SUPER_ADMIN') return null; // No restriction
  if (payload.role === 'SUB_AGENT') {
    const users = await prisma.user.findMany({
      where: { agentId: payload.userId },
      select: { id: true },
    });
    return [...users.map(u => u.id), payload.userId];
  }
  return [payload.userId]; // Regular user can only see themselves
}

/**
 * Block Sub-Agent from accessing platform-wide analytics.
 */
export function blockSubAgentAnalytics(payload: AuthPayload): NextResponse | null {
  if (payload.role === 'SUB_AGENT') {
    return NextResponse.json({ error: 'Forbidden: Platform analytics are restricted to Super Admin' }, { status: 403 });
  }
  return null;
}
