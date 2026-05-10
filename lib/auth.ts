import { cookies } from 'next/headers';
import { readAdminStore } from './adminStore';

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://central.prag.global/wp-json';

async function getCookieUserInfo(): Promise<Record<string, unknown> | null> {
  try {
    const cookieStore = await cookies();
    const userInfoStr = cookieStore.get('admin_user')?.value;
    if (!userInfoStr) return null;
    const parsed = JSON.parse(userInfoStr);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function login(username: string, password: string) {
  const res = await fetch(`${WP_API_URL}/jwt-auth/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) return null;
  return await res.json();
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const userInfo = cookieStore.get('admin_user')?.value;
  if (!token) return null;
  return { token, user: userInfo ? JSON.parse(userInfo) : null };
}

export async function isAdmin(token: string): Promise<boolean> {
  const cookieUser = await getCookieUserInfo();
  if (cookieUser && typeof cookieUser.isAdmin === 'boolean') {
    const allowedByRole = cookieUser.isAdmin;
    if (!allowedByRole) return false;

    const userId = Number(cookieUser.id);
    if (Number.isFinite(userId) && userId > 0) {
      const store = await readAdminStore();
      const state = store.users[String(userId)];
      if (!state) return true;
      return state.active;
    }

    return true;
  }

  try {
    const res = await fetch(`${WP_API_URL}/wp/v2/users/me?context=edit`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const data = await res.json();
    const allowedByRole = data?.roles?.some((r: string) => ['administrator', 'shop_manager'].includes(r.toLowerCase())) ?? false;
    if (!allowedByRole) return false;

    const store = await readAdminStore();
    const state = store.users[String(data.id)];
    if (!state) return true;
    return state.active;
  } catch {
    return false;
  }
}

export async function getCurrentWpUser(token: string): Promise<{ id: number; email: string; roles: string[] } | null> {
  try {
    const res = await fetch(`${WP_API_URL}/wp/v2/users/me?context=edit`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.id,
      email: data.email ?? '',
      roles: Array.isArray(data.roles) ? data.roles : [],
    };
  } catch {
    return null;
  }
}

export async function isSuperAdmin(token: string): Promise<boolean> {
  const cookieUser = await getCookieUserInfo();
  if (cookieUser && Array.isArray(cookieUser.roles)) {
    return cookieUser.roles.some((role) => String(role).toLowerCase() === 'administrator');
  }

  const user = await getCurrentWpUser(token);
  return user?.roles?.some((role) => role.toLowerCase() === 'administrator') ?? false;
}

export async function hasPortalAccess(token: string, portal: 'b2c' | 'b2b'): Promise<boolean> {
  const cookieUser = await getCookieUserInfo();
  if (cookieUser && cookieUser.id !== undefined) {
    const userId = Number(cookieUser.id);
    if (Number.isFinite(userId) && userId > 0) {
      const store = await readAdminStore();
      const state = store.users[String(userId)];
      if (!state || !state.active) return false;
      return state.portals.includes(portal);
    }
  }

  const user = await getCurrentWpUser(token);
  if (!user) return false;

  const store = await readAdminStore();
  const state = store.users[String(user.id)] ?? { active: true, portals: ['b2c'] };
  return state.active && state.portals.includes(portal);
}
