'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Clock, Loader2, Sparkles } from 'lucide-react';

// 博客文章类型
interface BlogPost {
  id: number;
  title: string;
  summary: string;
  created_at: string;
  readTime: number;
}

export default function BlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // 获取文章列表
  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog');
      const data = await res.json();
      if (data.success) {
        setPosts(data.data);
      } else {
        setError(data.error || '加载失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 生成新文章
  const handleGenerateArticle = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/blog/generate', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        // 重新获取文章列表
        await fetchPosts();
      } else {
        alert(data.error || '生成失败');
      }
    } catch (err) {
      alert('网络错误，请稍后重试');
    } finally {
      setGenerating(false);
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-pink-100 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                恋爱攻略
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                让每一份感情都被温柔对待
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateArticle}
              disabled={generating}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 hover:from-pink-600 hover:to-purple-600"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              {generating ? '生成中...' : 'AI写文章'}
            </Button>
            <div className="flex items-center gap-2 text-pink-500">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-medium">{posts.length} 篇文章</span>
            </div>
          </div>
        </div>
      </header>

      {/* 文章列表 */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              重新加载
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 mb-4">暂无文章</p>
            <Button
              onClick={handleGenerateArticle}
              disabled={generating}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              生成第一篇文章
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post, index) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.01] overflow-hidden">
                  <div className="p-6">
                    {/* 序号 */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-4xl font-bold text-pink-100 dark:text-pink-900/50 group-hover:text-pink-200 dark:group-hover:text-pink-800/50 transition-colors">
                        0{index + 1}
                      </span>
                    </div>

                    {/* 标题 */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                      {post.title}
                    </h2>

                    {/* 摘要 */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {post.summary}
                    </p>

                    {/* 元信息 */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                      <span>{formatDate(post.created_at)}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime} 分钟阅读</span>
                      </div>
                    </div>
                  </div>

                  {/* 底部装饰线 */}
                  <div className="h-1 bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* 底部提示 */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            恋爱需要学习，幸福需要经营
          </p>
        </div>
      </main>
    </div>
  );
}
