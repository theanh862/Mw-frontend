import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, User, Loader2, LogIn, Truck, Tag, CheckCircle, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { localized } from '@/lib/localize'
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LoginModal from '@/components/shop/LoginModal'
import AddressSelector from '@/components/shop/AddressSelector'
import api from '@/lib/api'

export default function Checkout() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { items, getCartTotal, clearCart } = useCartStore()
  const { user, updateProfile } = useAuthStore()

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  })
  const [address, setAddress] = useState({
    street: '', province: null, district: null, ward: null,
    fullAddress: '', districtId: null, wardCode: null,
  })
  const [shippingFee, setShippingFee] = useState(null)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('vnpay')
  const [saveInfo, setSaveInfo] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [voucherInput, setVoucherInput] = useState('')
  const [voucher, setVoucher] = useState(null)
  const [voucherLoading, setVoucherLoading] = useState(false)
  const [voucherError, setVoucherError] = useState('')

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddressChange = useCallback((addr) => {
    setAddress(addr)
  }, [])

  useEffect(() => {
    if (!address.districtId || !address.wardCode) {
      setShippingFee(null)
      return
    }

    const timeout = setTimeout(async () => {
      setShippingLoading(true)
      try {
        const total = getCartTotal()
        const res = await api.post('/shipping/fee', {
          to_district_id: address.districtId,
          to_ward_code: address.wardCode,
          weight: items.reduce((sum, item) => sum + item.quantity * 500, 0),
          insurance_value: Math.min(total, 5000000),
        })
        if (res.data?.code === 200) {
          setShippingFee(res.data.data.total)
        } else {
          setShippingFee(0)
        }
      } catch {
        setShippingFee(0)
      } finally {
        setShippingLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [address.districtId, address.wardCode])

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return
    setVoucherLoading(true)
    setVoucherError('')
    setVoucher(null)
    try {
      const res = await api.post('/vouchers/apply', {
        code: voucherInput.trim(),
        subtotal: getCartTotal(),
      })
      setVoucher(res.data)
    } catch (err) {
      setVoucherError(err.response?.data?.message || t('checkout.voucher_invalid'))
    } finally {
      setVoucherLoading(false)
    }
  }

  const handleRemoveVoucher = () => {
    setVoucher(null)
    setVoucherInput('')
    setVoucherError('')
  }

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.email) {
      alert(t('checkout.fill_required'))
      return
    }
    if (!address.districtId || !address.wardCode || !address.street) {
      alert(t('checkout.fill_address'))
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/orders', {
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: address.fullAddress,
        shippingFee: shippingFee ?? 0,
        voucherCode: voucher?.code || null,
        paymentMethod,
        items: items.map(item => ({
          product_id: item.productId,
          sku_id: item.skuId,
          quantity: item.quantity,
        })),
      })

      if (saveInfo) {
        try { await updateProfile({ name: formData.name, phone: formData.phone, address: address.fullAddress }) } catch (_) {}
      }

      const createdOrder = response.data

      if (paymentMethod === 'vnpay') {
        const vnpayRes = await api.post('/payment/vnpay/create', { orderId: createdOrder.id })
        if (vnpayRes.data?.paymentUrl) {
          window.location.href = vnpayRes.data.paymentUrl
        } else {
          throw new Error('Không nhận được liên kết thanh toán từ cổng VNPay.')
        }
      } else {
        clearCart()
        alert(t('checkout.order_success'))
        navigate('/orders')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      alert(err.response?.data?.message || err.message || 'Có lỗi xảy ra trong quá trình đặt hàng.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <>
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
            <div className="p-4 bg-amber-50 text-amber-500 rounded-full mb-6">
              <LogIn className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{t('common.login_required')}</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">{t('checkout.login_required_desc')}</p>
            <Button className="w-full bg-slate-900 font-bold py-6 rounded-2xl gap-2" onClick={() => setLoginOpen(true)}>
              <LogIn className="w-4 h-4" />
              {t('checkout.login_now')}
            </Button>
          </div>
        </div>
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      </>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-4">{t('checkout.empty_cart')}</h2>
        <Button onClick={() => navigate('/')}>{t('common.back_home')}</Button>
      </div>
    )
  }

  const subtotal = getCartTotal()
  const fee = shippingFee ?? 0
  const discount = voucher?.discountAmount ?? 0
  const grandTotal = Math.max(0, subtotal + fee - discount)

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-slate-900 text-left mb-8">{t('checkout.title')}</h1>

        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left column */}
          <div className="lg:col-span-8 space-y-6">

            {/* Customer info */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm text-left space-y-4">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <span className="bg-indigo-50 text-indigo-600 p-2 rounded-xl"><User className="w-5 h-5" /></span>
                {t('checkout.delivery_info')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('checkout.fullname')}</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nguyễn Văn A" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('checkout.phone')}</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="09xxxxxxxx" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('checkout.email')}</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="example@gmail.com" required />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-600 pt-1">
                <input type="checkbox" checked={saveInfo} onChange={e => setSaveInfo(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
                {t('checkout.save_info')}
              </label>
            </div>

            {/* Address */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm text-left space-y-4">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <span className="bg-indigo-50 text-indigo-600 p-2 rounded-xl"><Truck className="w-5 h-5" /></span>
                {t('checkout.shipping_address')}
              </h3>
              <AddressSelector value={{ street: '' }} onChange={handleAddressChange} />

              {/* Shipping fee result */}
              <div className="mt-2 p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-500" />
                  {t('checkout.shipping_fee')}
                </span>
                {!address.districtId || !address.wardCode ? (
                  <span className="text-xs text-slate-400">{t('checkout.select_address_first')}</span>
                ) : shippingLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                ) : shippingFee === null ? (
                  <span className="text-xs text-slate-400">—</span>
                ) : shippingFee === 0 ? (
                  <span className="text-green-600 font-bold text-sm">{t('common.free')}</span>
                ) : (
                  <span className="text-indigo-600 font-extrabold">{formatPrice(shippingFee)}</span>
                )}
              </div>
            </div>

            {/* Voucher */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm text-left space-y-3">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <span className="bg-indigo-50 text-indigo-600 p-2 rounded-xl"><Tag className="w-5 h-5" /></span>
                {t('checkout.voucher_title')}
              </h3>
              {voucher ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-bold text-green-700 text-sm">{voucher.code}</p>
                      <p className="text-xs text-green-600">{voucher.description}</p>
                    </div>
                  </div>
                  <button onClick={handleRemoveVoucher} className="text-slate-400 hover:text-red-500 transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={voucherInput}
                    onChange={e => { setVoucherInput(e.target.value.toUpperCase()); setVoucherError('') }}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyVoucher())}
                    placeholder={t('checkout.voucher_placeholder')}
                    className="rounded-xl font-mono tracking-widest uppercase"
                  />
                  <Button
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={voucherLoading || !voucherInput.trim()}
                    variant="outline"
                    className="rounded-xl font-bold border-indigo-300 text-indigo-600 hover:bg-indigo-50 px-5 flex-shrink-0"
                  >
                    {voucherLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('checkout.voucher_apply')}
                  </Button>
                </div>
              )}
              {voucherError && <p className="text-xs text-red-500">{voucherError}</p>}
            </div>

            {/* Payment method */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm text-left space-y-4">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <span className="bg-indigo-50 text-indigo-600 p-2 rounded-xl"><CreditCard className="w-5 h-5" /></span>
                {t('checkout.payment_method')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} className="text-indigo-600" />
                    <div className="text-left">
                      <p className="font-bold text-slate-900">{t('checkout.vnpay_name')}</p>
                      <p className="text-xs text-slate-500">{t('checkout.vnpay_desc')}</p>
                    </div>
                  </div>
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Mã QR</span>
                </label>

                <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-indigo-600" />
                    <div className="text-left">
                      <p className="font-bold text-slate-900">{t('checkout.cod_name')}</p>
                      <p className="text-xs text-slate-500">{t('checkout.cod_desc')}</p>
                    </div>
                  </div>
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">COD</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right column — Order summary */}
          <div className="lg:col-span-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm text-left space-y-6">
            <h3 className="font-extrabold text-xl text-slate-900 pb-4 border-b border-slate-100 flex items-center justify-between">
              <span>{t('checkout.your_order')}</span>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{t('checkout.items_count', { count: items.length })}</span>
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-3 divide-y divide-slate-100 pr-1">
              {items.map((item, idx) => (
                <div key={item.id} className={`flex gap-3 items-center text-sm ${idx > 0 ? 'pt-3' : ''}`}>
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-slate-800 truncate">{localized(item, 'name')}</p>
                    <p className="text-xs text-slate-500">{t('checkout.quantity')}: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-slate-700">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex justify-between text-slate-500 text-xs">
                <span>{t('checkout.original_price')}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-xs">
                <span>{t('checkout.shipping')}</span>
                {shippingLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : shippingFee === null ? (
                  <span className="text-slate-400">{t('checkout.calculating')}</span>
                ) : fee === 0 ? (
                  <span className="text-green-600 font-semibold">{t('common.free')}</span>
                ) : (
                  <span className="font-semibold text-slate-700">{formatPrice(fee)}</span>
                )}
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs text-green-600 font-semibold">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{voucher.code}</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-3 flex justify-between font-extrabold text-slate-900">
                <span>{t('checkout.total')}</span>
                <span className="text-indigo-600 text-lg">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || shippingLoading || shippingFee === null}
              className="w-full bg-slate-900 hover:bg-[#ffd400] hover:text-black font-extrabold py-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" />{t('checkout.processing')}</>
              ) : paymentMethod === 'vnpay' ? t('checkout.pay_vnpay') : t('checkout.confirm_cod')}
            </Button>
            {shippingFee === null && address.wardCode && (
              <p className="text-xs text-center text-slate-400">{t('checkout.calculating_fee')}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
