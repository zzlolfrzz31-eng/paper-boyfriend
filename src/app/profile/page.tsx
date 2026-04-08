import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, CheckCircle, XCircle, Calendar, MessageCircle, LogOut } from 'lucide-react';

// 游戏记录类型
interface GameRecord {
  id: number;
  user_id: number;
  scenario: string;
  final_score: number;
  result: string;
  played_at: string;
}

export default async function ProfilePage() {
  // 检查登录状态
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) {
    redirect('/login');
  }

  // 获取用户游戏记录
  const client = getSupabaseClient();
  const { data: records } = await client
    .from('game_records')
    .select('*')
    .eq('user_id', parseInt(userId, 10))
    .order('played_at', { ascending: false })
    .limit(20) as { data: GameRecord[] };

  // 计算统计数据
  const gameRecords = records || [];
  const totalGames = gameRecords.length;
  const passedGames = gameRecords.filter((r: GameRecord) => r.result === '通关').length;
  const passRate = totalGames > 0 ? Math.round((passedGames / totalGames) * 100) : 0;
  const avgScore = totalGames > 0 
    ? Math.round(gameRecords.reduce((sum: number, r: GameRecord) => sum + r.final_score, 0) / totalGames) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-pink-100 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            我的主页
          </h1>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                返回首页
              </Button>
            </Link>
            <form action="/api/auth/logout" method="POST">
              <Button 
                type="submit" 
                variant="outline" 
                size="sm"
                className="text-pink-500 border-pink-300 hover:bg-pink-50"
              >
                <LogOut className="h-4 w-4 mr-1" />
                退出登录
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-20">
        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-pink-500">{totalGames}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">总场次</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{passRate}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">通关率</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-500">{avgScore}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">平均分</p>
          </Card>
        </div>

        {/* 游戏记录列表 */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            游戏记录
          </h2>
        </div>

        {gameRecords.length === 0 ? (
          <Card className="p-8 text-center">
            <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              还没有游戏记录
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                开始聊天
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {gameRecords.map((record: GameRecord) => (
              <Card 
                key={record.id} 
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* 结果图标 */}
                    {record.result === '通关' ? (
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-orange-500" />
                      </div>
                    )}
                    
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {record.scenario}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {record.played_at 
                            ? new Date(record.played_at).toLocaleDateString('zh-CN', {
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '未知时间'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      record.final_score >= 70 ? 'text-green-500' : 'text-orange-500'
                    }`}>
                      {record.final_score}分
                    </p>
                    <Badge 
                      variant={record.result === '通关' ? 'default' : 'secondary'}
                      className={record.result === '通关' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200'
                      }
                    >
                      {record.result}
                    </Badge>
                  </div>
                </div>

                {/* 好感度进度条 */}
                <div className="mt-3">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${
                        record.final_score >= 70 
                          ? 'from-green-400 to-emerald-500'
                          : record.final_score >= 40
                            ? 'from-pink-400 to-purple-500'
                            : 'from-orange-400 to-red-500'
                      }`}
                      style={{ width: `${record.final_score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>好感度: {record.final_score}分</span>
                    <span>70分通关</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 快速操作 */}
        <div className="fixed bottom-6 left-0 right-0 px-4">
          <div className="container mx-auto">
            <Link href="/">
              <Button 
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium rounded-full shadow-lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                开始新对话
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
