'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, ArrowLeft, ArrowRight } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email?: string;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = ['active', 1
const ALL_STATUS = 'all';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUS);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
        ...(statusFilter !== ALL_STATUS && { status: statusFilter }),
      });
      
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.data);
        setTotal(data.total);
      }
    } catch (err) {
      setError('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditStatus(user.status);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccess('用户状态更新成功');
        setEditingUser(null);
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || '更新失败');
      }
    } catch (err) {
      setError('更新失败');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: '活跃',
      inactive: '未激活',
      suspended: '已封禁',
    };
    return labels[status] || status;
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索用户名或邮箱..."
                  value={search}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STATUS}>全部状态</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
                <p className="text-gray-600">加载中...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">用户名</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">邮箱</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">状态</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">注册时间</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500">
                          暂无用户数据
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 text-sm text-gray-900">{user.id}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{user.username}</td>
                          <td className="py-4 px-4 text-sm text-gray-600">{user.email || '-'}</td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusBadge(user.status)}>
                              {getStatusLabel(user.status)}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString('zh-CN')}
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              className="h-8 px-2 text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              编辑
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    共 {total} 条记录，第 {page} / {totalPages} 页
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      上一页
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      下一页
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑用户状态</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <p className="text-gray-900">{editingUser?.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditingUser(null)}
              disabled={saving}
            >
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-pink-600 hover:bg-pink-700">
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
