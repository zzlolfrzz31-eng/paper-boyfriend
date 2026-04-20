import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { cookies } from 'next/headers';

interface User {
  id: number;
  username: string;
  email?: string;
  status: string;
  created_at: string;
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

    let query = client.from('users').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    const transformedData = (data || []).map(item => ({
      id: item.id,
      username: item.username,
      email: item.email || null,
      status: item.status || 'active',
      created_at: item.created_at || item.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: transformedData as User[],
      total: count,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取失败' },
      { status: 500 }
    );
  }
}
