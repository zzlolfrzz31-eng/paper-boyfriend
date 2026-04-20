'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Eye, ArrowLeft, ArrowRight } from 'lucide-react';

interface Order {
  id: number;
  order_no?: string;
  user_id: number;
  scenario: string;
  final_score: number;
  result: string;
  status: string;
  amount: number;
  played_at: string;
  users?: { username: string; email?: string };
}

const STATUS_OPTIONS = ['pending', 'processing', 'completed', 'cancelled'];
const ALL_STATUS = 'all';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUS);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
        ...(statusFilter !== ALL_STATUS && { status: statusFilter }),
      });
      
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setOrders(data.data);
        setTotal(data.total);
      }
    } catch (err) {
      setError('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setEditStatus(order.status);
  };

  const handleView = (order: Order) => {
    setViewingOrder(order);
  };

  const handleSave = async () => {
    if (!editingOrder) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const res = await fetch(`/api/admin/orders/${editingOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccess('订单状态更新成功');
        setEditingOrder(null);
        fetchOrders();
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
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      completed: '已完成',
      cancelled: '已取消',
    };
    return labels[status] || status;
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
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
                  placeholder="搜索订单号、场景或用户名..."
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
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">订单号</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">用户</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">场景</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">金额</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">状态</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">创建时间</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500">
                          暂无订单数据
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 text-sm text-gray-900 font-mono">
                            {order.order_no || `#${order.id}`}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {order.users?.username || '未知用户'}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">{order.scenario}</td>
                          <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                            ¥{order.amount || 0}
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusBadge(order.status)}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {new Date(order.played_at).toLocaleDateString('zh-CN')}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(order)}
                                className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                查看
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(order)}
                                className="h-8 px-2 text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                编辑
                              </Button>
                            </div>
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

      <Dialog open={!!viewingOrder} onOpenChange={(open) => !open && setViewingOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">订单号</label>
                  <p className="text-gray-900 font-mono">{viewingOrder.order_no || `#${viewingOrder.id}`}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">状态</label>
                  <Badge className={getStatusBadge(viewingOrder.status)}>
                    {getStatusLabel(viewingOrder.status)}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">用户</label>
                  <p className="text-gray-900">{viewingOrder.users?.username || '未知用户'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">金额</label>
                  <p className="text-gray-900 font-medium">¥{viewingOrder.amount || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">场景</label>
                  <p className="text-gray-900">{viewingOrder.scenario}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">结果</label>
                  <p className="text-gray-900">{viewingOrder.result}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">分数</label>
                  <p className="text-gray-900">{viewingOrder.final_score}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">创建时间</label>
                  <p className="text-gray-900">
                    {new Date(viewingOrder.played_at).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewingOrder(null)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑订单状态</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">订单号</label>
              <p className="text-gray-900 font-mono">{editingOrder?.order_no || `#${editingOrder?.id}`}</p>
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
              onClick={() => setEditingOrder(null)}
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
