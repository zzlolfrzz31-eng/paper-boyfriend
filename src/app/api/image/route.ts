import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { ImageRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { prompt }: ImageRequest = await request.json();
    
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new ImageGenerationClient(config, customHeaders);

    // 调用图像生成API
    const response = await client.generate({
      prompt,
      size: '2K',
      watermark: false,
    });

    const helper = client.getResponseHelper(response);

    if (helper.success && helper.imageUrls.length > 0) {
      return NextResponse.json({ imageUrl: helper.imageUrls[0] });
    } else {
      console.error('Image generation failed:', helper.errorMessages);
      return NextResponse.json(
        { error: '照片生成失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Image API error:', error);
    return NextResponse.json(
      { error: '照片生成失败' },
      { status: 500 }
    );
  }
}
