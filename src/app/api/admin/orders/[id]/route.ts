import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { cookies } from 'next/headers';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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
      .select('is_admin')
      .eq('id', parseInt(userId, 10))
      .limit(1);

    if (userError || !currentUser || currentUser.length === 0 || !currentUser[0].is_admin) {
      return NextResponse.json(
        { success: false, error: '无权限访问' },
        { status: 403 }
      );
    }

    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'status不能为空' },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from('game_records')
      .update({ status })
      .eq('id', parseInt(params.id, 10))
      .select()
      .single();

    if (error) {
      throw new Error(`更新失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('更新订单失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '更新失败' },
      { status: 500 }
    );
  }
}
