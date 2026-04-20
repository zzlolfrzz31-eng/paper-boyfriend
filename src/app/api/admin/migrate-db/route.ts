import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST() {
  try {
    const client = getSupabaseClient();
    const results: string[] = [];

    results.push('开始数据库迁移...');

    try {
      await client.rpc('exec_sql', {
        sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255)'
      });
      results.push('✓ 添加 users.email 列');
    } catch (e) {
      results.push('⚠ users.email 列可能已存在');
    }

    try {
      await client.rpc('exec_sql', {
        sql: "ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' NOT NULL"
      });
      results.push('✓ 添加 users.status 列');
    } catch (e) {
      results.push('⚠ users.status 列可能已存在');
    }

    try {
      await client.rpc('exec_sql', {
        sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false NOT NULL'
      });
      results.push('✓ 添加 users.is_admin 列');
    } catch (e) {
      results.push('⚠ users.is_admin 列可能已存在');
    }

    try {
      await client.rpc('exec_sql', {
        sql: "ALTER TABLE game_records ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed' NOT NULL"
      });
      results.push('✓ 添加 game_records.status 列');
    } catch (e) {
      results.push('⚠ game_records.status 列可能已存在');
    }

    try {
      await client.rpc('exec_sql', {
        sql: 'ALTER TABLE game_records ADD COLUMN IF NOT EXISTS amount INTEGER DEFAULT 0 NOT NULL'
      });
      results.push('✓ 添加 game_records.amount 列');
    } catch (e) {
      results.push('⚠ game_records.amount 列可能已存在');
    }

    try {
      await client.rpc('exec_sql', {
        sql: 'ALTER TABLE game_records ADD COLUMN IF NOT EXISTS order_no VARCHAR(50)'
      });
      results.push('✓ 添加 game_records.order_no 列');
    } catch (e) {
      results.push('⚠ game_records.order_no 列可能已存在');
    }

    results.push('迁移完成！');

    return NextResponse.json({
      success: true,
      message: results.join('\n'),
    });
  } catch (error) {
    console.error('迁移失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '迁移失败',
    });
  }
}
