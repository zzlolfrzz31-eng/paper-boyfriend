'use client';

import { useState, useEffect } from 'react';
import { Trophy, User, Star, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RankItem {
  id: number;
  username: string;
  score: number;
  rank: number;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRanking() {
      try {
        const res = await fetch('/api/game/ranking');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setRanking(data.data);
          } else {
            setError(data.error || '获取排行榜失败');
          }
        } else {
          setError('网络请求失败');
        }
      } catch (err) {
        console.error('获取排行榜失败:', err);
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    }
    fetchRanking();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-pink-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-pink-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                排行榜
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 排行榜标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            人气排行榜
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            看看谁是最受欢迎的虚拟男友
          </p>
        </div>

        {/* 排行榜列表 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        ) : ranking.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">暂无排行榜数据</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ranking.map((item) => (
              <Card
                key={item.id}
                className={`flex items-center justify-between p-4 transition-all duration-300 hover:shadow-lg ${
                  item.rank <= 3
                    ? 'border-2 border-pink-300 dark:border-pink-700'
                    : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* 排名 */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30">
                    {item.rank === 1 ? (
                      <Crown className="h-6 w-6 text-yellow-500" />
                    ) : item.rank === 2 ? (
                      <Star className="h-6 w-6 text-gray-400" />
                    ) : item.rank === 3 ? (
                      <Star className="h-6 w-6 text-amber-700" />
                    ) : (
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {item.rank}
                      </span>
                    )}
                  </div>

                  {/* 用户信息 */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.username}</p>
                    </div>
                  </div>
                </div>

                {/* 分数 */}
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                    {item.score} 分
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 提示信息 */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>排名每小时更新一次</p>
        </div>
      </main>
    </div>
  );
}