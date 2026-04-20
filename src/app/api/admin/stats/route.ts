import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const client = getSupabaseClient();
    const { data: currentUser, error: userError } = await client
      .from('users')
      .select('*')
      .eq('id', parseInt(userId, 10))
      .limit(1);

    if (userError || !currentUser || currentUser.length === 0) {
      return NextResponse.json(
        { success: false, error: '无权限访问' },
        { status: 403 }
      );
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [usersResult, recentUsersResult, ordersResult, recentOrdersResult] = await Promise.all([
      client.from('users').select('*', { count: 'exact', head: true }),
      client.from('users').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString()),
      client.from('game_records').select('*', { count: 'exact', head: true }),
      client.from('game_records').select('*', { count: 'exact', head: true }).gte('played_at', sevenDaysAgo.toISOString()),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: usersResult.count || 0,
        recentUsers: recentUsersResult.count || 0,
        totalOrders: ordersResult.count || 0,
        recentOrders: recentOrdersResult.count || 0,
      },
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取失败' },
      { status: 500 }
    );
  }
}
