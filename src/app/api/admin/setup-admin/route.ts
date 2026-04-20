import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('users')
      .update({ is_admin: true, status: 'active' })
      .eq('id', userId)
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
    console.error('设置管理员失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '设置失败' },
      { status: 500 }
    );
  }
}
