import React, { useEffect, useState } from 'react'
import { Check, X, ClipboardList, Eye, Loader2, RotateCcw, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import api from '@/lib/api'

export default function AdminOrders() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [adminNote, setAdminNote] = useState('')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/orders')
      setOrders(response.data)
    } catch (err) {
      console.error('Fetch orders error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

  const updateOrder = (updatedOrder) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o))
    if (selectedOrder?.id === updatedOrder.id) setSelectedOrder(updatedOrder)
  }

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const response = await api.put(`/admin/orders/${id}/status`, { status: newStatus })
      updateOrder(response.data)
      alert(t('admin.orders.update_status_success'))
    } catch (err) {
      alert(err.response?.data?.message || t('admin.orders.update_status_fail'))
    }
  }

  const updateOrderPaymentStatus = async (id, newPaymentStatus) => {
    try {
      const response = await api.put(`/admin/orders/${id}/payment-status`, { paymentStatus: newPaymentStatus })
      updateOrder(response.data)
      alert(t('admin.orders.update_payment_success'))
    } catch (err) {
      alert(err.response?.data?.message || t('admin.orders.update_payment_fail'))
    }
  }

  const processReturn = async (id, action) => {
    try {
      const response = await api.post(`/admin/orders/${id}/return-process`, {
        action,
        adminNote: adminNote.trim() || null,
      })
      updateOrder(response.data)
      setAdminNote('')
      alert(t('admin.orders.return_process_success'))
    } catch (err) {
      alert(err.response?.data?.message || t('admin.orders.return_process_fail'))
    }
  }

  const completeRefund = async (id) => {
    try {
      const response = await api.post(`/admin/orders/${id}/refund-complete`)
      updateOrder(response.data)
      alert(t('admin.orders.refund_complete_success'))
    } catch (err) {
      alert(err.response?.data?.message || t('admin.orders.refund_complete_fail'))
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'processing': return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">{t('admin.orders.status_processing')}</span>
      case 'completed': return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">{t('admin.orders.status_completed')}</span>
      case 'cancelled': return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full">{t('admin.orders.status_cancelled')}</span>
      default: return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">{t('admin.orders.status_pending')}</span>
    }
  }

  const getPaymentStatusBadge = (status) => {
    if (status === 'paid') return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">{t('admin.orders.paid')}</span>
    return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">{t('admin.orders.unpaid')}</span>
  }

  const getReturnBadge = (order) => {
    if (!order.returnStatus) return null
    if (order.returnStatus === 'requested')
      return <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full">{t('admin.orders.return_requested_badge')}</span>
    if (order.returnStatus === 'approved') {
      if (order.refundStatus === 'refunded')
        return <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded-full">{t('admin.orders.refund_done_badge')}</span>
      if (order.refundStatus === 'processing')
        return <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">{t('admin.orders.refund_processing_badge')}</span>
      return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">{t('admin.orders.return_approved_badge')}</span>
    }
    if (order.returnStatus === 'rejected')
      return <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">{t('admin.orders.return_rejected_badge')}</span>
    return null
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 text-sm">{t('admin.orders.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-3xl font-black text-slate-900">{t('admin.orders.title')}</h2>
        <p className="text-sm text-slate-500">{t('admin.orders.subtitle')}</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>{t('admin.orders.col_id')}</TableHead>
              <TableHead>{t('admin.orders.col_customer')}</TableHead>
              <TableHead>{t('admin.orders.col_total')}</TableHead>
              <TableHead>{t('admin.orders.col_payment')}</TableHead>
              <TableHead>{t('admin.orders.col_status')}</TableHead>
              <TableHead>{t('admin.orders.col_date')}</TableHead>
              <TableHead className="w-32 text-center">{t('admin.orders.col_actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                  {t('admin.orders.no_orders')}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className={`hover:bg-slate-50 ${order.returnStatus === 'requested' ? 'bg-orange-50/50' : ''}`}>
                  <TableCell className="font-bold text-slate-900">
                    <div>{order.id}</div>
                    {order.returnStatus === 'requested' && (
                      <div className="flex items-center gap-1 text-orange-600 text-xs mt-0.5">
                        <AlertCircle className="w-3 h-3" />
                        {t('admin.orders.return_requested_badge')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-800">{order.customerName}</div>
                    <div className="text-xs text-slate-400">{order.phone}</div>
                  </TableCell>
                  <TableCell className="font-extrabold text-slate-900">{formatPrice(order.total)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(order.status)}
                      {getReturnBadge(order)}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400 text-xs">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1.5">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setSelectedOrder(order); setAdminNote('') }}
                            className="text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold">{t('admin.orders.detail_title', { orderId: selectedOrder?.id })}</DialogTitle>
                          </DialogHeader>

                          {selectedOrder && (
                            <div className="space-y-6 text-left py-4">
                              <div className="grid grid-cols-2 gap-4 text-sm border-b border-slate-100 pb-4">
                                <div>
                                  <p className="text-xs text-slate-400">{t('admin.orders.receiver')}</p>
                                  <p className="font-bold text-slate-800">{selectedOrder.customerName}</p>
                                  <p className="text-slate-500">{selectedOrder.phone}</p>
                                  <p className="text-slate-500">{selectedOrder.address}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-400">{t('admin.orders.invoice')}</p>
                                  <p className="font-medium">{t('admin.orders.payment_label')} <strong className="text-slate-800">{selectedOrder.paymentMethod.toUpperCase()}</strong></p>
                                  <p className="font-medium">{t('admin.orders.status_label')} {getStatusBadge(selectedOrder.status)}</p>
                                  <p className="font-medium">{t('admin.orders.amount_label')} {getPaymentStatusBadge(selectedOrder.paymentStatus)}</p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <h4 className="font-bold text-slate-800 text-sm">{t('admin.orders.items_label')}</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                  {selectedOrder.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-xl">
                                      <div>
                                        <p className="font-bold text-slate-800">{item.name}</p>
                                        <p className="text-xs text-slate-500">{t('admin.orders.quantity')}: {item.quantity} × {formatPrice(item.price)}</p>
                                      </div>
                                      <span className="font-extrabold text-slate-800">{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                                <span className="font-extrabold text-slate-900">{t('admin.orders.order_total')}</span>
                                <span className="text-xl font-black text-indigo-600">{formatPrice(selectedOrder.total)}</span>
                              </div>

                              {/* Order status actions */}
                              {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                                <div className="flex gap-2 pt-2 border-t border-slate-100">
                                  <Button
                                    onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold flex-grow"
                                  >
                                    <Check className="w-4 h-4 mr-2" /> {t('admin.orders.complete_btn')}
                                  </Button>
                                  <Button
                                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                                    variant="destructive"
                                    className="font-bold flex-grow"
                                  >
                                    <X className="w-4 h-4 mr-2" /> {t('admin.orders.cancel_btn')}
                                  </Button>
                                </div>
                              )}

                              {/* Return request section */}
                              {selectedOrder.returnStatus && (
                                <div className="border-t border-slate-100 pt-4 space-y-3">
                                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <RotateCcw className="w-4 h-4 text-orange-500" />
                                    {t('admin.orders.return_section')}
                                    {getReturnBadge(selectedOrder)}
                                  </h4>

                                  {selectedOrder.returnReason && (
                                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm">
                                      <p className="text-xs text-slate-400 mb-1">{t('admin.orders.return_reason')}</p>
                                      <p className="text-slate-700">{selectedOrder.returnReason}</p>
                                    </div>
                                  )}

                                  {selectedOrder.adminNote && (
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm">
                                      <p className="text-xs text-slate-400 mb-1">Ghi chú admin:</p>
                                      <p className="text-slate-700">{selectedOrder.adminNote}</p>
                                    </div>
                                  )}

                                  {selectedOrder.refundAmount && (
                                    <p className="text-sm font-semibold text-teal-600">
                                      {t('orders.return.refund_amount')} {formatPrice(selectedOrder.refundAmount)}
                                    </p>
                                  )}

                                  {selectedOrder.returnStatus === 'requested' && (
                                    <>
                                      <textarea
                                        value={adminNote}
                                        onChange={e => setAdminNote(e.target.value)}
                                        placeholder={t('admin.orders.return_admin_note')}
                                        rows={2}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => processReturn(selectedOrder.id, 'approve')}
                                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                                        >
                                          <Check className="w-4 h-4 mr-1" /> {t('admin.orders.return_approve_btn')}
                                        </Button>
                                        <Button
                                          onClick={() => processReturn(selectedOrder.id, 'reject')}
                                          variant="destructive"
                                          className="flex-1 font-bold"
                                        >
                                          <X className="w-4 h-4 mr-1" /> {t('admin.orders.return_reject_btn')}
                                        </Button>
                                      </div>
                                    </>
                                  )}

                                  {selectedOrder.returnStatus === 'approved' && selectedOrder.refundStatus === 'processing' && (
                                    <Button
                                      onClick={() => completeRefund(selectedOrder.id)}
                                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold"
                                    >
                                      <Check className="w-4 h-4 mr-2" /> {t('admin.orders.return_refund_btn')}
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
