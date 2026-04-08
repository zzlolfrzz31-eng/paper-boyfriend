import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 登出
export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // 删除登录状态 cookies
    cookieStore.delete('user_id');
    cookieStore.delete('username');

    return NextResponse.json({
      success: true,
      message: '已退出登录',
    });
  } catch (error) {
    console.error('登出失败:', error);
    return NextResponse.json(
      { success: false, error: '登出失败' },
      { status: 500 }
    );
  }
}
