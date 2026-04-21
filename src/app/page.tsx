'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { characters } from '@/lib/characters';
import { Character } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Heart, User, LogOut, Loader2, Trophy, Menu, X } from 'lucide-react';

// 用户类型
interface User {
  id: number;
  username: string;
}

export default function Home() {
  const router = useRouter();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 检查登录状态
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser(data.data);
          }
        }
      } catch (err) {
        // 未登录
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  // 登出
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setMobileMenuOpen(false);
    } catch (err) {
      console.error('登出失败:', err);
    }
  };

  const handleStartChat = () => {
    if (selectedCharacter) {
      // 将角色信息存储到sessionStorage
      sessionStorage.setItem('selectedCharacter', JSON.stringify(selectedCharacter));
      router.push('/chat');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-pink-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-pink-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                纸片人男友
              </span>
            </Link>

            {/* 桌面端导航 */}
            <nav className="hidden md:flex items-center gap-6">
              {/* 排行榜入口 */}
              <Link 
                href="/ranking" 
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
              >
                <Trophy className="h-4 w-4" />
                <span>排行榜</span>
              </Link>
              
              {/* 恋爱攻略入口 */}
              <Link 
                href="/blog" 
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span>恋爱攻略</span>
              </Link>

              {/* 用户状态 */}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-pink-500" />
                ) : user ? (
                  <>
                    <Link 
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 dark:bg-pink-900/20 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors"
                    >
                      <User className="h-4 w-4 text-pink-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.username}</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      退出登录
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-pink-500">
                        登录
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                        注册
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>

            {/* 移动端菜单按钮 */}
            <button 
              className="md:hidden p-2 text-gray-600 dark:text-gray-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* 移动端菜单 */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-pink-100 dark:border-gray-800">
              <nav className="flex flex-col gap-3">
                <Link 
                  href="/ranking" 
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Trophy className="h-5 w-5 text-pink-500" />
                  <span>排行榜</span>
                </Link>
                <Link 
                  href="/blog" 
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpen className="h-5 w-5 text-pink-500" />
                  <span>恋爱攻略</span>
                </Link>
                
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                
                {loading ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-pink-500" />
                  </div>
                ) : user ? (
                  <>
                    <Link 
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5 text-pink-500" />
                      <span className="font-medium">{user.username}</span>
                      <span className="text-xs text-gray-400 ml-auto">个人主页</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>退出登录</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="px-3 py-2 text-center text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      登录
                    </Link>
                    <Link 
                      href="/register" 
                      className="px-3 py-2 text-center bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      注册
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* 主标题区 */}
      <div className="pt-8 pb-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
          遇见你的心动男友
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          选择你心仪的虚拟男友，开启专属的恋爱之旅
        </p>
      </div>

      {/* 角色选择 */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {characters.map((char) => (
            <Card
              key={char.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                selectedCharacter?.id === char.id
                  ? 'ring-2 ring-pink-500 shadow-lg scale-[1.02]'
                  : 'hover:scale-[1.01]'
              }`}
              onClick={() => setSelectedCharacter(char)}
            >
              <div className="p-6 flex gap-4">
                {/* 头像 */}
                <div className="relative">
                  <img
                    src={char.avatar}
                    alt={char.name}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-pink-100 dark:ring-pink-900"
                  />
                  {selectedCharacter?.id === char.id && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>

                {/* 信息 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {char.name}
                    </h2>
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200">
                      {char.personality}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {char.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {char.traits.map((trait) => (
                      <span
                        key={trait}
                        className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 开始按钮 */}
        <div className="mt-8 text-center">
          <Button
            size="lg"
            disabled={!selectedCharacter}
            onClick={handleStartChat}
            className={`px-12 py-6 text-lg font-medium transition-all duration-300 ${
              selectedCharacter
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedCharacter ? `和 ${selectedCharacter.name} 开始聊天` : '请选择一位男友'}
          </Button>
        </div>

        {/* 功能入口 */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/ranking">
            <Card className="flex items-center gap-3 px-6 py-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
              <Trophy className="h-5 w-5 text-amber-500" />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">排行榜</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">查看人气排行</p>
              </div>
            </Card>
          </Link>
          
          <Link href="/blog">
            <Card className="flex items-center gap-3 px-6 py-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-800">
              <BookOpen className="h-5 w-5 text-pink-500" />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">恋爱攻略</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">学会爱与被爱</p>
              </div>
            </Card>
          </Link>
        </div>

        {/* 提示 */}
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          刷新页面会清空聊天记录，想好再来哦～
        </p>
      </main>

      {/* 底部装饰 */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-pink-100/50 to-transparent dark:from-pink-900/20 pointer-events-none" />
    </div>
  );
}
