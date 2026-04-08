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

    // 计算阅读时间
    const post = {
      ...(data as BlogPost),
      readTime: Math.max(1, Math.ceil(data.content.length / 300)),
    };

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('获取文章详情失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取文章详情失败' },
      { status: 500 }
    );
  }
}
