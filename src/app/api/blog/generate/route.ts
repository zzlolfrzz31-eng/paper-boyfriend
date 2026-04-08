import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 生成恋爱沟通技巧文章
export async function POST(request: NextRequest) {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 生成文章的系统提示词
    const systemPrompt = `你是一位专业的情感咨询师和恋爱心理专家，擅长撰写恋爱沟通技巧相关的文章。
你的文章风格温暖、实用、贴近生活，适合18-35岁的年轻女性阅读。

请生成一篇关于恋爱沟通技巧的文章，要求：
1. 标题：吸引人、有共鸣感，15-25字
2. 摘要：概括文章核心观点，50-100字
3. 正文：300-500字，包含具体的场景和实用建议

文章格式要求：
- 使用 **加粗** 来强调重点
- 使用 - 列表项来列举要点
- 使用 ✅ 和 ❌ 来对比正确和错误的做法
- 语言要温柔、有同理心

请按以下JSON格式输出（不要包含其他内容）：
{
  "title": "文章标题",
  "summary": "文章摘要",
  "content": "文章正文（保留格式）"
}`;

    // 调用LLM生成文章
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: '请生成一篇关于恋爱沟通技巧的文章，主题可以包括：如何表达爱意、如何处理矛盾、如何增进理解、如何建立信任等。请随机选择一个主题创作。' },
    ];

    const stream = client.stream(messages, { 
      temperature: 0.9,
      model: 'doubao-seed-1-8-251228'
    });

    let content = '';
    for await (const chunk of stream) {
      if (chunk.content) {
        content += chunk.content.toString();
      }
    }

    // 解析JSON
    let article;
    try {
      // 提取JSON部分（去除可能的markdown代码块标记）
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('无法解析文章内容');
      }
      article = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('解析文章失败:', content);
      return NextResponse.json(
        { success: false, error: '文章生成失败，请重试' },
        { status: 500 }
      );
    }

    // 验证必要字段
    if (!article.title || !article.summary || !article.content) {
      return NextResponse.json(
        { success: false, error: '文章内容不完整' },
        { status: 500 }
      );
    }

    // 保存到数据库
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('blog_posts')
      .insert({
        title: article.title,
        summary: article.summary,
        content: article.content,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`保存文章失败: ${error.message}`);
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        id: data.id,
        title: article.title,
        summary: article.summary,
        content: article.content,
        created_at: data.created_at,
      }
    });
  } catch (error) {
    console.error('生成文章失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '生成文章失败' },
      { status: 500 }
    );
  }
}
