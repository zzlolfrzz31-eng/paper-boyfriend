import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 排行榜项目类型
interface RankItem {
  id: number;
  username: string;
  score: number;
  rank: number;
}

// GET: 获取排行榜
export async function GET() {
  try {
    const client = getSupabaseClient();
    
    // 查询所有用户的最高分记录，按分数降序排列
    const { data, error } = await client
      .from('game_records')
      .select(`
        user_id,
        final_score,
        users(username)
      `)
      .order('final_score', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(`查询排行榜失败: ${error.message}`);
    }

    // 处理数据，只保留每个用户的最高分
    const userScores = new Map<number, { username: string; score: number }>();
    
    data?.forEach(record => {
      const userId = record.user_id;
      const currentScore = record.final_score;
      const username = record.users?.username || '未知用户';

      if (!userScores.has(userId) || currentScore > userScores.get(userId)!.score) {
        userScores.set(userId, { username, score: currentScore });
      }
    });

    // 转换为排行榜格式并添加排名
    const ranking: RankItem[] = Array.from(userScores.entries())
      .map(([id, user]) => ({
        id,
        username: user.username,
        score: user.score,
        rank: 0 // 将在下面设置
      }))
      .sort((a, b) => b.score - a.score);

    // 设置排名
    ranking.forEach((item, index) => {
      item.rank = index + 1;
    });

    return NextResponse.json({
      success: true,
      data: ranking,
    });
  } catch (error) {
    console.error('获取排行榜失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
    }, { status: 500 });
  }
}