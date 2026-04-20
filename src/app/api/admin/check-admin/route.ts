import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    const { data: users, error } = await client
      .from('users')
      .select('id, username, is_admin')
      .eq('id', parseInt(userId, 10))
      .limit(1);

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: users[0].id,
        username: users[0].username,
        isAdmin: users[0].is_admin,
      },
    });
  } catch (error) {
    console.error('检查管理员失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '检查失败' },
      { status: 500 }
    );
  }
}
