import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 博客文章类型
interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  created_at: string;
  view_count: number;
}

// GET: 获取单篇文章详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);

    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: '无效的文章ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    
    // 获取文章详情
    const { data, error } = await client
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .maybeSingle();

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: '文章不存在' },
        { status: 404 }
      );
    }

    // 增加文章总浏览量
    await client
      .from('blog_posts')
      .update({ view_count: (data as BlogPost).view_count + 1 })
      .eq('id', postId);

    // 记录每日浏览量
    const today = new Date().toISOString().split('T')[0];
    const dailyViewKey = `${postId}_${today}`;
    
    // 检查是否已存在今日的浏览量记录
    const existingDailyView = await client
      .from('blog_daily_views')
      .select('*')
      .eq('post_id', postId)
      .gte('view_date', `${today} 00:00:00`)
      .lt('view_date', `${today} 23:59:59`)
      .maybeSingle();

    if (existingDailyView.data) {
      // 更新今日浏览量
      await client
        .from('blog_daily_views')
        .update({ view_count: existingDailyView.data.view_count + 1 })
        .eq('id', existingDailyView.data.id);
    } else {
      // 新增今日浏览量记录
      await client
        .from('blog_daily_views')
        .insert({
          post_id: postId,
          view_date: new Date().toISOString(),
          view_count: 1
        });
    }

    // 计算阅读时间
    const post = {
      ...(data as BlogPost),
      readTime: Math.max(1, Math.ceil(data.content.length / 300)),
    };

    return NextResponse.json({ 
      success: true, 
      data: { ...post, view_count: post.view_count + 1 } 
    });
  } catch (error) {
    console.error('获取文章详情失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取文章详情失败' },
      { status: 500 }
    );
  }
}
