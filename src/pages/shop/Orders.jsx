import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldAlert, Loader2, RotateCcw, X, Search, ShoppingBag, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { localized } from '@/lib/localize'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'
import api from '@/lib/api'

const TABS = [
  { key: 'all',        labelKey: 'orders.tab_all' },
  { key: 'pending',    labelKey: 'orders.tab_pending' },
  { key: 'processing', labelKey: 'orders.tab_processing' },
  { key: 'completed',  labelKey: 'orders.tab_completed' },
  { key: 'cancelled',  labelKey: 'orders.tab_cancelled' },
  { key: 'return',     labelKey: 'orders.tab_return' },
]

export default function Orders() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuthStore()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  const [returnModal, setReturnModal] = useState(null)
  const [returnReason, setReturnReason] = useState('')
  const [returnLoading, setReturnLoading] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get('/orders')
        setOrders(Array.isArray(res.data) ? res.data : res.data?.data ?? [])
      } catch {
        setError(t('orders.error_desc'))
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user, authLoading, t])

  const formatPrice = (p) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p)

  const filteredOrders = useMemo(() => {
    let list = orders
    if (activeTab === 'return') {
      list = list.filter(o => o.returnStatus)
    } else if (activeTab !== 'all') {
      list = list.filter(o => o.status === activeTab && !o.returnStatus)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        (o.items ?? []).some(i => i.name?.toLowerCase().includes(q))
      )
    }
    return list
  }, [orders, activeTab, search])

  const handleReturnSubmit = async () => {
    if (returnReason.trim().length < 10) {
      alert(t('orders.return.error_min'))
      return
    }
    setReturnLoading(true)
    try {
      const res = await api.post(`/orders/${returnModal.id}/return-request`, { reason: returnReason })
      setOrders(prev => prev.map(o => o.id === returnModal.id ? res.data : o))
      setReturnModal(null)
      setReturnReason('')
      alert(t('orders.return.success'))
    } catch (err) {
      alert(err.response?.data?.message || t('orders.return.error_min'))
    } finally {
      setReturnLoading(false)
    }
  }

  const handleBuyAgain = (order) => {
    const existing = [...useCartStore.getState().items]
    order.items?.forEach(item => {
      const cartId = item.skuId ? `${item.productId}-${item.skuId}` : String(item.productId)
      const idx = existing.findIndex(i => i.id === cartId)
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], quantity: existing[idx].quantity + item.quantity }
      } else {
        existing.push({
          id: cartId,
          productId: item.productId,
          skuId: item.skuId || null,
          skuCode: null, skuName: null, skuName_en: null,
          name: item.name,
          name_en: item.name_en || item.name,
          price: item.price,
          originalPrice: item.price,
          image: item.image,
          quantity: item.quantity,
        })
      }
    })
    useCartStore.setState({ items: existing })
    navigate('/cart')
  }

  const getStatusLabel = (order) => {
    if (order.returnStatus === 'requested') return { text: t('orders.return.status_requested'), cls: 'text-orange-500' }
    if (order.returnStatus === 'approved' && order.refundStatus === 'processing') return { text: t('orders.return.refund_processing'), cls: 'text-blue-500' }
    if (order.returnStatus === 'approved' && order.refundStatus === 'refunded') return { text: t('orders.return.refund_done'), cls: 'text-teal-500' }
    if (order.returnStatus === 'rejected') return { text: t('orders.return.status_rejected'), cls: 'text-red-500' }
    switch (order.status) {
      case 'processing': return { text: t('orders.status.processing'), cls: 'text-blue-500' }
      case 'completed':  return { text: t('orders.status.completed'),  cls: 'text-green-600' }
      case 'cancelled':  return { text: t('orders.status.cancelled'),  cls: 'text-red-500' }
      default:           return { text: t('orders.status.pending'),    cls: 'text-amber-500' }
    }
  }

  if (!user && !authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="p-4 bg-amber-50 text-amber-500 rounded-full mb-6"><ShieldAlert className="w-12 h-12" /></div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{t('common.login_required')}</h2>
          <p className="text-slate-500 text-sm mb-8">{t('orders.login_required_desc')}</p>
          <Link to="/"><Button className="w-full bg-slate-900 font-bold py-6 rounded-2xl">{t('common.back_home')}</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-100 min-h-screen pb-16">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-4">{t('orders.title')}</h1>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-100">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-5 py-4 text-sm font-semibold transition-colors whitespace-nowrap border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="p-3 border-b border-slate-50">
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('orders.search_placeholder')}
                className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
            <p className="text-slate-400 text-sm">{t('orders.loading')}</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-10 text-center">
            <p className="text-slate-500 text-sm mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">{t('common.retry')}</Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl py-16 flex flex-col items-center gap-4">
            <ShoppingBag className="w-16 h-16 text-slate-200" />
            <p className="font-bold text-slate-400">{t('orders.empty_title')}</p>
            <Link to="/"><Button className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 rounded-full">{t('orders.explore')}</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(order => {
              const statusInfo = getStatusLabel(order)
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* Order header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-600">{order.id}</span>
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wide ${statusInfo.cls}`}>
                      {statusInfo.text}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-slate-50">
                    {(order.items ?? []).map(item => (
                      <div key={item.id} className="flex gap-3 px-5 py-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm line-clamp-2 leading-snug">
                            {localized(item, 'name')}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">x{item.quantity}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-slate-800">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Return info if any */}
                  {order.returnReason && (
                    <div className="mx-5 mb-3 p-3 bg-orange-50 border border-orange-100 rounded-xl text-xs text-slate-600">
                      <span className="font-semibold text-orange-600">{t('orders.return.reason_label_display')}</span> {order.returnReason}
                      {order.adminNote && <><br /><span className="font-semibold text-slate-500">{t('orders.return.admin_note_display')}</span> {order.adminNote}</>}
                      {order.refundStatus === 'refunded' && order.refundAmount && (
                        <><br /><span className="font-semibold text-teal-600">{t('orders.return.refund_amount')} {formatPrice(order.refundAmount)}</span></>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between px-5 py-4 border-t border-slate-50">
                    <div className="text-sm text-slate-500">
                      <span className="font-semibold text-slate-700">{t('orders.order_total')}</span>{' '}
                      <span className="text-base font-extrabold text-red-500">{formatPrice(order.total)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.status === 'completed' && !order.returnStatus && (
                        <button
                          onClick={() => { setReturnModal(order); setReturnReason('') }}
                          className="text-xs font-semibold text-slate-600 border border-slate-300 hover:border-slate-400 px-3 py-2 rounded-lg transition-colors"
                        >
                          {t('orders.return.btn')}
                        </button>
                      )}
                      <button
                        onClick={() => handleBuyAgain(order)}
                        className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                      >
                        {t('orders.buy_again')}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Return modal */}
      {returnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900">{t('orders.return.title')}</h3>
              <button onClick={() => setReturnModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 font-semibold">{returnModal.id}</p>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">{t('orders.return.reason_label')}</label>
              <textarea
                value={returnReason}
                onChange={e => setReturnReason(e.target.value)}
                placeholder={t('orders.return.reason_placeholder')}
                rows={4}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleReturnSubmit}
                disabled={returnLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-5 rounded-xl gap-2"
              >
                {returnLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                {returnLoading ? t('orders.return.submitting') : t('orders.return.submit')}
              </Button>
              <Button variant="outline" onClick={() => setReturnModal(null)} className="font-bold py-5 rounded-xl px-5 border-slate-300">
                {t('orders.return.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
