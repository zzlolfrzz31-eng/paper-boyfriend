import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 用户类型
interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

// 注册
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    if (username.length < 2 || username.length > 50) {
      return NextResponse.json(
        { success: false, error: '用户名长度需要在2-50个字符之间' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码长度至少6个字符' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查用户名是否已存在
    const { data: existingUsers, error: checkError } = await client
      .from('users')
      .select('id')
      .eq('username', username)
      .limit(1);

    if (checkError) {
      throw new Error(`查询失败: ${checkError.message}`);
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: '用户名已存在' },
        { status: 400 }
      );
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const { data, error } = await client
      .from('users')
      .insert({ username, password: hashedPassword })
      .select('id, username, created_at')
      .single();

    if (error) {
      throw new Error(`创建用户失败: ${error.message}`);
    }

    // 设置登录状态 cookie
    const cookieStore = await cookies();
    cookieStore.set('user_id', data.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
    });
    cookieStore.set('username', data.username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        username: data.username,
        created_at: data.created_at,
      },
    });
  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '注册失败' },
      { status: 500 }
    );
  }
}
