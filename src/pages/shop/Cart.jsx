import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { localized } from '@/lib/localize'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/button'

export default function Cart() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { items, updateQuantity, removeItem, clearCart, getCartTotal } = useCartStore()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-6">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{t('cart.empty_title')}</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">{t('cart.empty_desc')}</p>
          <Link to="/" className="w-full">
            <Button className="w-full bg-slate-900 hover:bg-[#ffd400] hover:text-black font-bold py-6 rounded-2xl transition-colors">
              {t('cart.back_shopping')}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-slate-900 text-left mb-8">{t('cart.title', { count: items.length })}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 text-left"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-grow space-y-2">
                  <Link to={`/product/${item.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 text-base">
                    {localized(item, 'name')}
                  </Link>
                  <div className="text-indigo-600 font-extrabold">{formatPrice(item.price)}</div>
                </div>

                <div className="flex items-center gap-3 border border-slate-200 rounded-full px-3 py-1 bg-slate-55 flex-shrink-0">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 text-slate-500 hover:text-slate-900 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-slate-500 hover:text-slate-900 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button onClick={() => removeItem(item.id)} className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-2xl transition-colors flex-shrink-0">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" onClick={clearCart} className="text-red-500 border-red-200 hover:bg-red-50 font-bold px-6 py-5 rounded-2xl">
                {t('cart.clear')}
              </Button>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm text-left space-y-6">
            <h3 className="font-extrabold text-xl text-slate-900 pb-4 border-b border-slate-100">{t('cart.summary')}</h3>

            <div className="space-y-4">
              <div className="flex justify-between text-slate-500 text-sm">
                <span>{t('cart.subtotal')}</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm">
                <span>{t('cart.shipping')}</span>
                <span className="text-green-600 font-semibold">{t('common.free')}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm">
                <span>{t('cart.discount')}</span>
                <span>- 0đ</span>
              </div>
              <div className="border-t border-slate-100 pt-4 flex justify-between font-extrabold text-slate-900 text-lg">
                <span>{t('cart.total')}</span>
                <span className="text-indigo-600">{formatPrice(getCartTotal())}</span>
              </div>
            </div>

            <Button onClick={() => navigate('/checkout')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-2xl transition-colors gap-2">
              {t('cart.checkout')}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
