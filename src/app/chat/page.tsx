'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Character, Message, Gift } from '@/lib/types';
import { characters, gifts, getAffectionLevel, getPhotoInterval } from '@/lib/characters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Gift as GiftIcon, 
  ArrowLeft,
  Heart,
  Volume2,
  VolumeX,
  Share2,
  LogOut,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [affection, setAffection] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [lastPhotoRound, setLastPhotoRound] = useState(0);
  const [showGifts, setShowGifts] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioErrors, setAudioErrors] = useState<Set<string>>(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 检查登录状态
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setIsLoggedIn(data.success);
      } catch {
        setIsLoggedIn(false);
      }
    }
    checkAuth();
  }, []);

  // 初始化角色
  useEffect(() => {
    const stored = sessionStorage.getItem('selectedCharacter');
    if (stored) {
      const char = JSON.parse(stored) as Character;
      setCharacter(char);
      
      // 添加初始消息
      const greeting = getGreeting(char);
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: greeting,
        timestamp: Date.now(),
      }]);
    } else {
      router.push('/');
    }
  }, [router]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 获取问候语
  function getGreeting(char: Character): string {
    const greetings: Record<string, string> = {
      'cold-ceo': '...你来了。有什么事吗？',
      'warm-doctor': '你好呀～今天过得怎么样？',
      'sunny-idol': '哇！你来找我啦！开心～',
      'mysterious-artist': '...嗯，我在这里。',
    };
    return greetings[char.id] || '你好，我是' + char.name + '。';
  }

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || !character || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // 添加用户消息
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    // 添加打字中状态
    const typingMsg: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMsg]);

    try {
      // 调用聊天API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          character,
          history: messages.filter(m => !m.isTyping).map(m => ({
            role: m.role,
            content: m.content,
          })),
          affection,
          messageCount,
        }),
      });

      const data = await response.json();
      
      // 移除打字状态
      setMessages(prev => prev.filter(m => !m.isTyping));

      // 添加AI回复
      const aiMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);

      // 生成语音
      generateVoice(aiMsg.id, data.content);

      // 如果需要发送照片
      if (data.shouldSendPhoto && data.photoPrompt) {
        setTimeout(() => {
          generateAndSendPhoto(data.photoPrompt);
        }, 1000);
      }

      // 更新消息计数
      setMessageCount(prev => prev + 1);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.filter(m => !m.isTyping));
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '...信号不太好，你再说一次？',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // 生成语音
  const generateVoice = async (messageId: string, text: string) => {
    if (!character) return;
    
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          speaker: character.voiceStyle,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, audioUrl: data.audioUrl } : m
        ));
      }
    } catch (error) {
      console.error('TTS error:', error);
      setAudioErrors(prev => new Set([...prev, messageId]));
    }
  };

  // 生成并发送照片
  const generateAndSendPhoto = async (prompt: string) => {
    if (!character) return;

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, character }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // 添加照片消息
        const photoMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '📸',
          timestamp: Date.now(),
          imageUrl: data.imageUrl,
        };
        setMessages(prev => [...prev, photoMsg]);
        
        // 增加好感度
        setAffection(prev => Math.min(100, prev + 5));
      }
    } catch (error) {
      console.error('Image generation error:', error);
      // 静默跳过
    }
  };

  // 播放语音
  const playAudio = async (messageId: string, audioUrl: string) => {
    try {
      if (playingAudio === messageId) {
        setPlayingAudio(null);
        return;
      }

      setPlayingAudio(messageId);
      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingAudio(null);
      audio.onerror = () => {
        setAudioErrors(prev => new Set([...prev, messageId]));
        setPlayingAudio(null);
      };
      await audio.play();
    } catch {
      setAudioErrors(prev => new Set([...prev, messageId]));
      setPlayingAudio(null);
    }
  };

  // 重试语音生成
  const retryAudio = async (messageId: string, content: string) => {
    setAudioErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(messageId);
      return newSet;
    });
    await generateVoice(messageId, content);
  };

  // 发送礼物
  const sendGift = async (gift: Gift) => {
    if (!character) return;
    
    setShowGifts(false);

    // 添加礼物消息
    const giftMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `送给你 ${gift.emoji} ${gift.name}`,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, giftMsg]);

    // 增加好感度
    setAffection(prev => Math.min(100, prev + gift.affectionBonus));

    // 生成感谢回复
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `用户送给你${gift.name}，你要表示感谢并表现出开心的样子`,
          character,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          affection: affection + gift.affectionBonus,
          messageCount,
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
      }]);
    } catch (error) {
      console.error('Gift response error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 结束对话
  const endChat = () => {
    setShowEndDialog(true);
  };

  // 确认结束并保存记录
  const confirmEndChat = async () => {
    setSaving(true);
    
    const result = affection >= 70 ? '通关' : '失败';
    
    try {
      // 尝试保存游戏记录
      const res = await fetch('/api/game/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: character?.name || '未知角色',
          finalScore: affection,
          result,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('您的游戏记录已经保存');
      } else if (data.needLogin) {
        alert('登录后可保存你的游戏记录');
      } else {
        alert(data.error || '保存失败');
      }
    } catch (error) {
      console.error('Save game record error:', error);
      alert('保存失败，请稍后重试');
    } finally {
      setSaving(false);
      setShowEndDialog(false);
      router.push('/');
    }
  };

  // 取消结束
  const cancelEndChat = () => {
    setShowEndDialog(false);
  };

  // 直接返回（不保存记录）
  const goBack = () => {
    if (confirm('直接返回会丢失当前聊天记录，确定要返回吗？')) {
      router.push('/');
    }
  };

  // 分享功能
  const shareToFriend = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '纸片人男友',
          text: `我在和一个超甜的虚拟男友「${character?.name}」聊天！你也来试试～`,
          url: window.location.origin,
        });
      } catch {
        // 用户取消分享
      }
    } else {
      // 复制链接
      navigator.clipboard.writeText(window.location.origin);
      alert('链接已复制，快去分享给闺蜜吧～');
    }
  };

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  const result = affection >= 70 ? '通关' : '失败';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* 头部 */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-pink-100 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img
              src={character.avatar}
              alt={character.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-200 dark:ring-pink-800"
            />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {character.name}
              </h2>
              <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200">
                {character.personality}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 好感度显示 */}
            <div className="flex items-center gap-1 px-2 py-1 bg-pink-50 dark:bg-pink-900/30 rounded-full">
              <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
              <span className="text-sm font-medium text-pink-600 dark:text-pink-300">
                {affection}
              </span>
            </div>

            {/* 结束对话按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={endChat}
              className="text-pink-500 border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/30"
            >
              <LogOut className="h-4 w-4 mr-1" />
              结束
            </Button>

            {/* 分享按钮 */}
            <Button variant="ghost" size="icon" onClick={shareToFriend}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* 好感度进度条 */}
        <div className="px-4 pb-2">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                affection >= 70 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                  : affection >= 40
                    ? 'bg-gradient-to-r from-pink-400 to-purple-500'
                    : 'bg-gradient-to-r from-orange-400 to-red-500'
              }`}
              style={{ width: `${affection}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>好感度: {getAffectionLevel(affection)}</span>
            <span>70分通关</span>
          </div>
        </div>
      </header>

      {/* 聊天区域 */}
      <ScrollArea className="flex-1 container mx-auto px-4 py-4">
        <div className="space-y-4 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] ${
                  message.role === 'user'
                    ? 'order-1'
                    : 'order-2'
                }`}
              >
                {/* 消息内容 */}
                {message.isTyping ? (
                  <div className="flex gap-1 p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <>
                    <div
                      className={`p-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-pink-500 text-white rounded-tr-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {message.imageUrl ? (
                        <img
                          src={message.imageUrl}
                          alt="自拍"
                          className="max-w-full rounded-lg"
                          loading="lazy"
                        />
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>

                    {/* 语音播放按钮 */}
                    {message.role === 'assistant' && !message.imageUrl && (
                      <div className="mt-1">
                        {message.audioUrl ? (
                          <button
                            onClick={() => playAudio(message.id, message.audioUrl!)}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
                              playingAudio === message.id
                                ? 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-pink-900/30'
                            }`}
                          >
                            {playingAudio === message.id ? (
                              <VolumeX className="h-3 w-3" />
                            ) : (
                              <Volume2 className="h-3 w-3" />
                            )}
                            {playingAudio === message.id ? '停止' : '播放语音'}
                          </button>
                        ) : audioErrors.has(message.id) ? (
                          <button
                            onClick={() => retryAudio(message.id, message.content)}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                          >
                            语音生成失败，点击重试
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400">
                            <Volume2 className="h-3 w-3 animate-pulse" />
                            语音生成中...
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* AI头像 */}
              {message.role === 'assistant' && !message.isTyping && (
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-100 dark:ring-pink-900 ml-2 flex-shrink-0"
                />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* 礼物面板 */}
      {showGifts && (
        <div className="absolute bottom-20 left-0 right-0 bg-white dark:bg-gray-800 border-t border-pink-100 dark:border-gray-700 p-4 shadow-lg">
          <div className="container mx-auto">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">选择礼物送给他：</p>
            <div className="flex flex-wrap gap-2">
              {gifts.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => sendGift(gift)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-pink-50 dark:bg-pink-900/30 hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors"
                >
                  <span className="text-2xl">{gift.emoji}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{gift.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-pink-100 dark:border-gray-700 p-4">
        <div className="container mx-auto flex items-center gap-2">
          {/* 礼物按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowGifts(!showGifts)}
            className="text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/30"
          >
            <GiftIcon className="h-5 w-5" />
          </Button>

          {/* 输入框 */}
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="说点什么..."
            className="flex-1 rounded-full border-pink-200 focus:border-pink-400 focus:ring-pink-400 dark:border-gray-600 dark:focus:border-pink-500"
            disabled={isLoading}
          />

          {/* 发送按钮 */}
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="rounded-full bg-pink-500 hover:bg-pink-600 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 结束对话确认弹窗 */}
      {showEndDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-sm mx-4 p-6 bg-white dark:bg-gray-800">
            <div className="text-center">
              {result === '通关' ? (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              )}
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {result === '通关' ? '恭喜通关！' : '再接再厉'}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                与 <span className="font-medium">{character.name}</span> 的好感度：
                <span className={`font-bold ${affection >= 70 ? 'text-green-500' : 'text-orange-500'}`}>
                  {' '}{affection}分
                </span>
              </p>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {result === '通关' 
                  ? '你们的关系更进一步了！' 
                  : '距离通关还需要再努力一下哦～'}
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={cancelEndChat}
                  className="flex-1"
                  disabled={saving}
                >
                  继续聊天
                </Button>
                <Button
                  onClick={confirmEndChat}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      保存中
                    </>
                  ) : (
                    '结束并保存'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
