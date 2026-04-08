# 项目上下文

## 项目概述

**纸片人男友** - 一个虚拟恋爱聊天产品，让用户体验与有性格的虚拟男友聊天。

### 核心功能
- 4个预设虚拟男友角色（冷酷总裁、温柔医生、阳光偶像、神秘画家）
- 微信风格聊天界面
- AI对话（LLM）+ 语音合成（TTS）+ 图像生成
- 送礼物互动
- 会话内好感度系统
- 分享给闺蜜功能

### 目标用户
18-35岁年轻女性，深夜孤独、无聊打发时间场景

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **AI SDK**: coze-coding-dev-sdk

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts    # LLM对话API
│   │   │   ├── tts/route.ts     # 语音合成API
│   │   │   └── image/route.ts   # 图像生成API
│   │   ├── chat/page.tsx        # 聊天页面
│   │   ├── layout.tsx           # 根布局
│   │   └── page.tsx             # 首页（角色选择）
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── hooks/              # 自定义 Hooks
│   └── lib/
│       ├── types.ts        # 类型定义
│       ├── characters.ts   # 角色数据和礼物配置
│       └── utils.ts        # 工具函数
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

## API 接口

### POST /api/chat
聊天对话API，调用LLM生成回复
- 请求：`{ message, character, history, affection, messageCount }`
- 响应：`{ content, shouldSendPhoto, emotion, photoPrompt? }`

### POST /api/tts
语音合成API
- 请求：`{ text, speaker }`
- 响应：`{ audioUrl }`

### POST /api/image
图像生成API
- 请求：`{ prompt, character }`
- 响应：`{ imageUrl }`

## AI能力触发规则

### LLM对话
- 用户发送消息时触发
- 基于当前对话上下文，刷新清空

### TTS语音
- 每条AI回复自动生成语音
- 用户点击播放按钮收听

### 图像生成（发自拍）
- 情绪触发（开心、害羞等话题）
- 用户主动要求（"发张照片"）
- 固定轮次（3-6轮发一张，好感度高时更频繁）

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。

## 开发规范

- **Hydration 错误预防**：严禁在 JSX 渲染逻辑中直接使用动态数据
- **UI 组件**：使用 shadcn/ui 组件库
- **会话管理**：使用 sessionStorage 存储角色选择，刷新清空聊天记录

## UI 设计与组件规范

- 模板默认预装核心组件库 `shadcn/ui`，位于`src/components/ui/`目录下
- 移动端优先设计，交互对标微信私聊
- 粉色系主题，浪漫温馨风格


