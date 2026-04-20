'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ShoppingCart, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/admin',
      label: '概览',
      icon: Home,
    },
    {
      href: '/admin/users',
      label: '用户管理',
      icon: Users,
    },
    {
      href: '/admin/orders',
      label: '订单管理',
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        <aside className="w-64 bg-gray-900 text-white flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h1 className="text-xl font-bold">管理后台</h1>
          </div>
          
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-800">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>返回前台</span>
            </Link>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {navItems.find((item) => item.href === pathname)?.label || '管理后台'}
              </h2>
            </div>
          </header>

          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
