import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { cookies } from 'next/headers';

interface Order {
  id: number;
  order_no?: string;
  user_id: number;
  scenario: string;
  final_score: number;
  result: string;
  status: string;
  amount: number;
  played_at: string;
  users?: { username: string; email?: string };
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    let query = client.from('game_records').select('*, users(username, email)', { count: 'exact' });

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('played_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    const transformedData = (data || []).map(item => ({
      id: item.id,
      order_no: item.order_no || null,
      user_id: item.user_id,
      scenario: item.scenario,
      final_score: item.final_score,
      result: item.result,
      status: item.status || 'completed',
      amount: item.amount || 0,
      played_at: item.played_at || item.playedAt,
      users: item.users && item.users.length > 0 ? item.users[0] : undefined,
    }));

    return NextResponse.json({
      success: true,
      data: transformedData as unknown as Order[],
      total: count,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取失败' },
      { status: 500 }
    );
  }
}
