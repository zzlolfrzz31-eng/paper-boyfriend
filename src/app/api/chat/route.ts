import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { ChatRequest, ChatResponse } from '@/lib/types';
import { getAffectionPrompt } from '@/lib/characters';

export async function POST(request: NextRequest) {
  try {
    const { message, character, history, affection, messageCount }: ChatRequest = await request.json();
    
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建消息历史
    const messages = [
      { role: 'system' as const, content: character.systemPrompt + getAffectionPrompt(affection) },
      ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user' as const, content: message },
    ];

    // 调用LLM生成回复
    const stream = client.stream(messages, { 
      temperature: 0.8,
      model: 'doubao-seed-1-8-251228'
    });

    let content = '';
    for await (const chunk of stream) {
      if (chunk.content) {
        content += chunk.content.toString();
      }
    }

    // 判断是否需要发送照片
    const shouldSendPhoto = checkShouldSendPhoto(message, messageCount, affection, content);
    
    // 分析情绪
    const emotion = analyzeEmotion(content);

    const response: ChatResponse = {
      content,
      shouldSendPhoto,
      emotion,
      photoPrompt: shouldSendPhoto ? generatePhotoPrompt(character, emotion) : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: '他好像走神了，再说一次？' },
      { status: 500 }
    );
  }
}

// 检查是否应该发送照片
function checkShouldSendPhoto(
  userMessage: string, 
  messageCount: number, 
  affection: number,
  aiResponse: string
): boolean {
  // 用户主动要求发照片
  if (userMessage.includes('照片') || userMessage.includes('自拍') || userMessage.includes('看看你')) {
    return true;
  }

  // 固定轮次触发 (3-6轮)
  const interval = affection >= 70 ? 2 : affection >= 30 ? 4 : 5;
  if (messageCount > 0 && messageCount % interval === 0) {
    return true;
  }

  // 情绪触发 - 根据AI回复内容判断
  if (aiResponse.includes('开心') || aiResponse.includes('害羞') || 
      aiResponse.includes('想你了') || aiResponse.includes('想你')) {
    return Math.random() > 0.5; // 50%概率发照片
  }

  return false;
}

// 分析情绪
function analyzeEmotion(content: string): 'happy' | 'shy' | 'neutral' | 'caring' {
  if (content.includes('害羞') || content.includes('脸红') || content.includes('...')) {
    return 'shy';
  }
  if (content.includes('开心') || content.includes('喜欢') || content.includes('高兴') || content.includes('！')) {
    return 'happy';
  }
  if (content.includes('想你') || content.includes('担心') || content.includes('关心') || content.includes('照顾')) {
    return 'caring';
  }
  return 'neutral';
}

// 生成照片提示词 - 使用角色统一外观
function generatePhotoPrompt(character: { name: string; personality: string; appearance: string }, emotion: string): string {
  const emotionPrompts: Record<string, string> = {
    happy: 'smiling warmly, happy expression, bright eyes',
    shy: 'shy expression, slightly blushing, looking away',
    caring: 'gentle smile, caring eyes, warm expression',
    neutral: 'natural expression, calm and composed',
  };

  // 使用角色的统一外观描述，确保头像和自拍形象一致
  return `${character.appearance}, ${emotionPrompts[emotion]}, selfie angle, soft natural lighting, high quality anime style portrait, consistent character design`;
}
