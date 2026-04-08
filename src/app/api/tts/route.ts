import { NextRequest, NextResponse } from 'next/server';
import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { TTSRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { text, speaker }: TTSRequest = await request.json();
    
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new TTSClient(config, customHeaders);

    // 调用TTS生成语音
    const response = await client.synthesize({
      uid: 'virtual-boyfriend-user',
      text,
      speaker: speaker || 'zh_male_dayi_saturn_bigtts',
      audioFormat: 'mp3',
      sampleRate: 24000,
    });

    return NextResponse.json({ audioUrl: response.audioUri });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: '语音生成失败，点击重试' },
      { status: 500 }
    );
  }
}
