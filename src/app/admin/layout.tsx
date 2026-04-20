'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

interface AdminPageProps {
  children: React.ReactNode;
}

export default function AdminPageLayout({ children }: AdminPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!data.success) {
          router.push('/login');
          return;
        }

        setIsAdmin(true);
      } catch (err) {
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    }

    checkAdmin();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
