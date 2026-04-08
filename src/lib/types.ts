// 虚拟男友角色类型
export interface Character {
  id: string;
  name: string;
  personality: string;
  description: string;
  avatar: string;
  traits: string[];
  voiceStyle: string;
  appearance: string;  // 角色外观描述，用于生成统一形象的自拍
  systemPrompt: string;
}

// 聊天消息类型
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  audioUrl?: string;
  imageUrl?: string;
  isTyping?: boolean;
}

// 好感度等级
export interface AffectionLevel {
  score: number;
  level: 'low' | 'medium' | 'high';
  title: string;
}

// 礼物类型
export interface Gift {
  id: string;
  name: string;
  emoji: string;
  affectionBonus: number;
}

// 聊天状态
export interface ChatState {
  messages: Message[];
  character: Character | null;
  affection: number;
  messageCount: number;
  lastPhotoRound: number;
}

// API 请求类型
export interface ChatRequest {
  message: string;
  character: Character;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  affection: number;
  messageCount: number;
}

export interface ChatResponse {
  content: string;
  shouldSendPhoto: boolean;
  photoPrompt?: string;
  emotion?: 'happy' | 'shy' | 'neutral' | 'caring';
}

export interface TTSRequest {
  text: string;
  speaker: string;
}

export interface TTSResponse {
  audioUrl: string;
}

export interface ImageRequest {
  prompt: string;
  character: Character;
}

export interface ImageResponse {
  imageUrl: string;
}
