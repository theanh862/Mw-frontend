import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ShieldCheck, CheckCircle2, XCircle, QrCode } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/useCartStore'

export default function VNPaySimulator() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const clearCart = useCartStore((state) => state.clearCart)

  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')
  const [paymentStep, setPaymentStep] = useState('gateway')

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const responseCode = searchParams.get('vnp_ResponseCode')

  useEffect(() => {
    if (responseCode) {
      if (responseCode === '00') { clearCart(); setPaymentStep('success') }
      else { setPaymentStep('failed') }
    }
  }, [responseCode, clearCart])

  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="w-20 h-20 text-green-500 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">{t('vnpay.success_title')}</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            {t('vnpay.success_desc', { orderId })}
          </p>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">{t('vnpay.order_id')}</span>
              <span className="font-bold text-slate-800">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t('vnpay.amount')}</span>
              <span className="font-bold text-indigo-600">{formatPrice(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t('vnpay.status')}</span>
              <span className="text-green-600 font-bold">{t('vnpay.paid_status')}</span>
            </div>
          </div>
          <Button onClick={() => navigate('/orders')} className="w-full bg-slate-900 hover:bg-[#ffd400] hover:text-black font-extrabold py-6 rounded-2xl">
            {t('vnpay.view_history')}
          </Button>
        </div>
      </div>
    )
  }

  if (paymentStep === 'failed') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="flex justify-center">
            <XCircle className="w-20 h-20 text-red-500 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">{t('vnpay.failed_title')}</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            {t('vnpay.failed_desc', { orderId })}
          </p>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">{t('vnpay.order_id')}</span>
              <span className="font-bold text-slate-800">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t('vnpay.status')}</span>
              <span className="text-red-600 font-bold">{t('vnpay.unpaid_status')}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/checkout')} variant="outline" className="flex-grow font-bold py-6 rounded-2xl">{t('vnpay.retry')}</Button>
            <Button onClick={() => navigate('/orders')} className="flex-grow bg-slate-900 font-bold py-6 rounded-2xl">{t('vnpay.view_order')}</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 flex flex-col items-center justify-center font-sans">
      <div className="mb-6 flex items-center gap-2">
        <span className="bg-[#005baa] text-white font-black px-4 py-2 rounded-xl text-2xl tracking-widest italic">VNPAY</span>
        <span className="text-slate-400 font-semibold">{t('vnpay.gateway_subtitle')}</span>
      </div>

      <div className="bg-white max-w-2xl w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-5 bg-gradient-to-br from-[#005baa] to-[#008ae6] text-white p-6 md:p-8 flex flex-col justify-between text-left space-y-8">
          <div>
            <span className="inline-block bg-white/20 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider mb-4">
              {t('vnpay.sandbox')}
            </span>
            <p className="text-sm text-slate-200">{t('vnpay.beneficiary')}</p>
            <p className="font-bold text-lg">{t('vnpay.company')}</p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-200">{t('vnpay.order_code')}</p>
              <p className="font-extrabold text-xl">{orderId}</p>
            </div>
            <div>
              <p className="text-xs text-slate-200">{t('vnpay.transaction_amount')}</p>
              <p className="font-black text-2xl text-[#ffd400]">{formatPrice(amount)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-200 border-t border-white/20 pt-4">
            <ShieldCheck className="w-4 h-4 text-[#ffd400]" />
            <span>{t('vnpay.ssl')}</span>
          </div>
        </div>

        <div className="md:col-span-7 p-6 md:p-8 text-left space-y-6 flex flex-col justify-center">
          <div className="space-y-2">
            <h3 className="font-extrabold text-lg text-slate-900">{t('vnpay.simulator_title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('vnpay.simulator_desc')}</p>
          </div>

          <div className="border border-slate-100 bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl border border-slate-200 flex-shrink-0">
              <QrCode className="w-16 h-16 text-slate-700" />
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <p className="font-bold text-slate-800">{t('vnpay.qr_title')}</p>
              <p>{t('vnpay.qr_desc')}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button onClick={() => { clearCart(); setPaymentStep('success') }} className="w-full bg-[#005baa] hover:bg-[#004b8c] text-white font-extrabold py-5 rounded-2xl">
              {t('vnpay.simulate_success')}
            </Button>
            <Button onClick={() => setPaymentStep('failed')} variant="outline" className="w-full border-red-200 text-red-500 hover:bg-red-50 font-bold py-5 rounded-2xl">
              {t('vnpay.simulate_cancel')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
