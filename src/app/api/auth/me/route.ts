import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 获取当前登录用户信息
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    const username = cookieStore.get('username')?.value;

    if (!userId || !username) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: parseInt(userId, 10),
        username,
      },
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { success: false, error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
