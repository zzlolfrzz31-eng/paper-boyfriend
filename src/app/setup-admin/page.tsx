'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SetupAdminPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSetupAdmin = async () => {
    try {
      setStatus('loading');
      setMessage('');

      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();

      if (!authData.success) {
        setStatus('error');
        setMessage('请先登录');
        return;
      }

      const userId = authData.data.id;

      const res = await fetch('/api/admin/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage('✅ 成功设置为管理员！现在可以访问 /admin');
      } else {
        setStatus('error');
        setMessage(data.error || '设置失败');
      }
    } catch (err) {
      setStatus('error');
      setMessage('设置失败');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>设置管理员</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            点击下方按钮将当前登录用户设置为管理员
          </p>

          {message && (
            <div className={`p-3 rounded ${
              status === 'success' ? 'bg-green-50 text-green-700' :
              status === 'error' ? 'bg-red-50 text-red-700' :
              'bg-gray-50 text-gray-700'
            }`}>
              {message}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={handleSetupAdmin}
              disabled={status === 'loading'}
              className="flex-1 bg-pink-600 hover:bg-pink-700"
            >
              {status === 'loading' ? '设置中...' : '设置为管理员'}
            </Button>
            <a href="/admin" className="flex-1">
              <Button variant="ghost" className="w-full">
                去后台
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
