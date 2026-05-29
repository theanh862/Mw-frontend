import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, ShoppingBag, ClipboardList, Users, ArrowUpRight, DollarSign, Loader2, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6']

const CustomTooltip = ({ active, payload, label, revenueLabel }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 shadow-xl text-xs space-y-1 text-left">
        <p className="font-bold">{label}</p>
        <p className="text-indigo-400 font-extrabold font-mono">
          {revenueLabel}: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

const StatusTooltip = ({ active, payload, ordersUnit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 shadow-xl text-xs font-bold text-left">
        {payload[0].payload.name}: {payload[0].value} {ordersUnit}
      </div>
    )
  }
  return null
}

const CategoryTooltip = ({ active, payload, productsLabel }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 shadow-xl text-xs space-y-1 text-left">
        <p className="font-bold">{payload[0].name}</p>
        <p className="text-emerald-400 font-extrabold">{payload[0].payload.count} {productsLabel} ({payload[0].value}%)</p>
      </div>
    )
  }
  return null
}


export default function AdminDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const response = await api.get('/admin/dashboard')
        setStats(response.data)
      } catch (err) {
        console.error('Fetch dashboard stats error:', err)
        setError(t('admin.dashboard.error_desc'))
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [t])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'processing':
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">{t('admin.dashboard.status_processing')}</span>
      case 'completed':
        return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">{t('admin.dashboard.status_completed')}</span>
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full">{t('admin.dashboard.status_cancelled')}</span>
      default:
        return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">{t('admin.dashboard.status_pending')}</span>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 text-sm">{t('admin.dashboard.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="p-4 bg-red-50 text-red-500 rounded-full mb-6">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{t('common.error_load')}</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">{error}</p>
          <Button onClick={() => window.location.reload()} className="w-full bg-slate-900 font-bold py-6 rounded-2xl">
            {t('common.retry')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-3xl font-black text-slate-900">{t('admin.dashboard.title')}</h2>
        <p className="text-sm text-slate-500">{t('admin.dashboard.subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-slate-200/60 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">{t('admin.dashboard.revenue')}</CardTitle>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> {t('admin.dashboard.revenue_stable')}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">{t('admin.dashboard.new_orders')}</CardTitle>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><ClipboardList className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{stats.totalOrders} {t('admin.dashboard.orders_unit')}</div>
            <p className="text-xs text-slate-400 mt-1">{t('admin.dashboard.pending_orders', { count: stats.pendingOrders })}</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">{t('admin.dashboard.products')}</CardTitle>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><ShoppingBag className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{stats.totalProducts} {t('admin.dashboard.products_unit')}</div>
            <p className="text-xs text-slate-400 mt-1">{t('admin.dashboard.products_in_cat', { count: stats.totalCategories })}</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">{t('admin.dashboard.customers')}</CardTitle>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Users className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{stats.totalCustomers} {t('admin.dashboard.customers_unit')}</div>
            <p className="text-xs text-[#ffd400] font-bold flex items-center gap-1 mt-1">
              {t('admin.dashboard.customers_google')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6 text-left">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">{t('admin.dashboard.revenue_chart')}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{t('admin.dashboard.revenue_chart_desc')}</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueByMonth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip revenueLabel={t('admin.dashboard.revenue_label')} />} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6 text-left">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">{t('admin.dashboard.order_status_chart')}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{t('admin.dashboard.order_status_chart_desc')}</p>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ordersByStatus} barSize={28} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip content={<StatusTooltip ordersUnit={t('admin.dashboard.orders_unit')} />} cursor={{ fill: '#f8fafc', radius: 8 }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {stats.ordersByStatus.map((entry, index) => {
                    const statusColors = {
                      pending: '#f59e0b',
                      processing: '#3b82f6',
                      completed: '#10b981',
                      cancelled: '#ef4444'
                    }
                    return <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#cbd5e1'} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Charts & Table section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-lg text-slate-900">{t('admin.dashboard.recent_orders')}</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              {t('admin.dashboard.view_all')} <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>{t('admin.dashboard.col_order')}</TableHead>
                  <TableHead>{t('admin.dashboard.col_customer')}</TableHead>
                  <TableHead>{t('admin.dashboard.col_total')}</TableHead>
                  <TableHead>{t('admin.dashboard.col_status')}</TableHead>
                  <TableHead>{t('admin.dashboard.col_date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                      {t('admin.dashboard.no_orders')}
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recentOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50">
                      <TableCell className="font-bold text-slate-900">{order.id}</TableCell>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell className="font-extrabold text-slate-800">{formatPrice(order.total)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-slate-400 text-xs">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
          <h3 className="font-extrabold text-lg text-slate-900 text-left">{t('admin.dashboard.category_chart')}</h3>

          <div className="h-[180px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="percentage"
                  nameKey="name"
                >
                  {stats.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CategoryTooltip productsLabel={t('admin.dashboard.products_center')} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-black text-slate-800">{stats.totalProducts}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">{t('admin.dashboard.products_center')}</span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {stats.categoryBreakdown.map((cat, index) => {
              const color = COLORS[index % COLORS.length]
              return (
                <div key={cat.id} className="space-y-1.5 text-left">
                  <div className="flex justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-slate-600">{cat.name}</span>
                    </div>
                    <span className="text-slate-900">{cat.percentage}% ({cat.count} SP)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
