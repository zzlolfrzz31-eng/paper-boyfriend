import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 游戏记录类型
interface GameRecord {
  id: number;
  user_id: number;
  scenario: string;
  final_score: number;
  result: string;
  played_at: string;
}

// POST: 保存游戏记录
export async function POST(request: NextRequest) {
  try {
    // 检查登录状态
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '未登录',
        needLogin: true,
      }, { status: 401 });
    }

    const body = await request.json();
    const { scenario, finalScore, result } = body;

    // 验证输入
    if (!scenario || finalScore === undefined || !result) {
      return NextResponse.json({
        success: false,
        error: '缺少必要字段',
      }, { status: 400 });
    }

    // 验证 result 值
    if (result !== '通关' && result !== '失败') {
      return NextResponse.json({
        success: false,
        error: '结果值无效',
      }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('game_records')
      .insert({
        user_id: parseInt(userId, 10),
        scenario,
        final_score: finalScore,
        result,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`保存失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: '您的游戏记录已经保存',
    });
  } catch (error) {
    console.error('保存游戏记录失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '保存失败',
    }, { status: 500 });
  }
}

// GET: 获取当前用户的游戏记录
export async function GET() {
  try {
    // 检查登录状态
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '未登录',
      }, { status: 401 });
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('game_records')
      .select('*')
      .eq('user_id', parseInt(userId, 10))
      .order('played_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: data as GameRecord[],
    });
  } catch (error) {
    console.error('获取游戏记录失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
    }, { status: 500 });
  }
}
