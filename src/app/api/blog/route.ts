import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 博客文章类型
interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  created_at: string;
}

// GET: 获取所有文章列表
export async function GET() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('blog_posts')
      .select('id, title, summary, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    // 计算阅读时间（按字数估算，约300字/分钟）
    const posts = (data as BlogPost[]).map(post => ({
      ...post,
      readTime: Math.max(1, Math.ceil(post.content?.length / 300 || post.summary.length / 100)),
    }));

    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error('获取博客列表失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取博客列表失败' },
      { status: 500 }
    );
  }
}

// POST: 生成新文章（由其他 API 调用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, summary, content } = body;

    if (!title || !summary || !content) {
      return NextResponse.json(
        { success: false, error: '缺少必要字段' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('blog_posts')
      .insert({ title, summary, content })
      .select()
      .single();

    if (error) {
      throw new Error(`插入失败: ${error.message}`);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建文章失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '创建文章失败' },
      { status: 500 }
    );
  }
}
