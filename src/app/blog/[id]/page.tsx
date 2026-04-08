'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Share2, Home, Loader2 } from 'lucide-react';

// 博客文章类型
interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  created_at: string;
  readTime: number;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/blog/${postId}`);
        const data = await res.json();
        if (data.success) {
          setPost(data.data);
        } else {
          setError(data.error || '文章不存在');
        }
      } catch (err) {
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [postId]);

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 分享功能
  const handleShare = async () => {
    if (!post) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.summary,
          url: window.location.href,
        });
      } catch {
        // 用户取消分享
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制！');
    }
  };

  // 将文章内容按段落分割并渲染
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // 空行
      if (!line.trim()) {
        return <div key={index} className="h-4" />;
      }
      
      // 标题（**包围的内容）
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h3 key={index} className="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">
            {line.replace(/\*\*/g, '')}
          </h3>
        );
      }
      
      // 列表项
      if (line.startsWith('- ') || line.startsWith('✅') || line.startsWith('❌')) {
        return (
          <div key={index} className="flex items-start gap-2 my-2 text-gray-700 dark:text-gray-300">
            <span className="text-pink-500 mt-1">•</span>
            <span>{line.replace(/^[-✅❌]\s*/, '')}</span>
          </div>
        );
      }
      
      // 普通段落
      return (
        <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed my-2">
          {line}
        </p>
      );
    });
  };

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  // 错误或文章不存在
  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || '文章不存在'}
          </h1>
          <Button onClick={() => router.push('/blog')}>
            返回博客列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-pink-100 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/blog')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Home className="h-5 w-5" />
            </Link>
          </div>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* 文章内容 */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <article>
          {/* 标题 */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>

          {/* 元信息 */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-6 border-b border-pink-100 dark:border-gray-700">
            <span>{formatDate(post.created_at)}</span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} 分钟阅读</span>
            </div>
          </div>

          {/* 摘要 */}
          <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4 mb-8">
            <p className="text-gray-700 dark:text-gray-300 italic">
              {post.summary}
            </p>
          </div>

          {/* 正文 */}
          <div className="prose prose-pink max-w-none">
            {renderContent(post.content)}
          </div>
        </article>

        {/* 推荐阅读 */}
        <div className="mt-12 pt-8 border-t border-pink-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            继续阅读
          </h3>
          <Button variant="outline" onClick={() => router.push('/blog')}>
            查看更多文章
          </Button>
        </div>
      </main>
    </div>
  );
}
