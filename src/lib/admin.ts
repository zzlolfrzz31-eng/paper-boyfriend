import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export interface AdminUser {
  id: number;
  username: string;
  email?: string;
  isAdmin: boolean;
  status: string;
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return null;
    }

    const client = getSupabaseClient();
    const { data: users, error } = await client
      .from('users')
      .select('id, username, email, is_admin, status')
      .eq('id', parseInt(userId, 10))
      .limit(1);

    if (error || !users || users.length === 0) {
      return null;
    }

    const user = users[0];
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.is_admin,
      status: user.status,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getCurrentAdminUser();
  if (!user || !user.isAdmin) {
    return null;
  }
  return user;
}
