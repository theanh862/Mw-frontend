import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Star, Heart, ArrowLeft, ShieldCheck, Truck, RotateCcw, Plus, Minus, Check, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { localized } from '@/lib/localize'
import api from '@/lib/api'
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import LoginModal from '@/components/shop/LoginModal'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const addItem = useCartStore((state) => state.addItem)
  const user = useAuthStore((state) => state.user)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSkus, setSelectedSkus] = useState({})

  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [ratingInput, setRatingInput] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [contentInput, setContentInput] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/products/${id}`)
      .then(res => {
        const p = res.data
        const mappedProduct = {
          ...p,
          originalPrice: p.original_price,
          reviewsCount: p.reviews_count,
          category: p.category ? p.category.name : '',
          specs: p.specs || {},
          specs_en: p.specs_en || null,
          skus: p.skus || []
        }
        setProduct(mappedProduct)

        if (mappedProduct.skus && mappedProduct.skus.length > 0) {
          setSelectedSkus({ [mappedProduct.skus[0].id]: 1 })
        } else {
          setSelectedSkus({})
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching product detail:', err)
        setLoading(false)
      })

    setReviewsLoading(true)
    api.get(`/products/${id}/reviews`)
      .then(res => {
        setReviews(res.data)
        setReviewsLoading(false)
      })
      .catch(err => {
        console.error('Error fetching reviews:', err)
        setReviewsLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-medium">{t('product.loading')}</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('product.not_found')}</h2>
        <Link to="/"><Button>{t('common.back_home')}</Button></Link>
      </div>
    )
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const getRatingLabel = (rating) => {
    if (rating === 5) return t('product.rating_5')
    if (rating === 4) return t('product.rating_4')
    if (rating === 3) return t('product.rating_3')
    if (rating === 2) return t('product.rating_2')
    return t('product.rating_1')
  }

  const handleToggleSku = (skuId) => {
    setSelectedSkus(prev => {
      const next = { ...prev }
      if (skuId in next) delete next[skuId]
      else next[skuId] = 1
      return next
    })
  }

  const handleQuantityChange = (skuId, change) => {
    setSelectedSkus(prev => {
      if (!(skuId in prev)) return prev
      const newQty = prev[skuId] + change
      if (newQty < 1) return prev

      const sku = product.skus.find(s => s.id === skuId)
      if (sku && newQty > sku.stock) {
        alert(t('product.stock_exceeded', { stock: sku.stock }))
        return prev
      }
      return { ...prev, [skuId]: newQty }
    })
  }

  const getSelectedTotal = () => {
    let total = 0
    Object.entries(selectedSkus).forEach(([skuId, qty]) => {
      const sku = product.skus.find(s => s.id === Number(skuId))
      if (sku) total += sku.price * qty
    })
    return total
  }

  const handleAddToCart = () => {
    if (product.skus && product.skus.length > 0) {
      const selectedEntries = Object.entries(selectedSkus)
      if (selectedEntries.length === 0) {
        alert(t('product.select_sku_alert'))
        return
      }
      selectedEntries.forEach(([skuId, qty]) => {
        const sku = product.skus.find(s => s.id === Number(skuId))
        addItem(product, sku, qty)
      })
      alert(t('product.added_variants', { count: selectedEntries.length }))
    } else {
      addItem(product, null, 1)
      alert(t('product.added_to_cart'))
    }
  }

  const handleBuyNow = () => {
    if (product.skus && product.skus.length > 0) {
      const selectedEntries = Object.entries(selectedSkus)
      if (selectedEntries.length === 0) {
        alert(t('product.select_sku_buy_alert'))
        return
      }
      selectedEntries.forEach(([skuId, qty]) => {
        const sku = product.skus.find(s => s.id === Number(skuId))
        addItem(product, sku, qty)
      })
      navigate('/cart')
    } else {
      addItem(product, null, 1)
      navigate('/cart')
    }
  }

  const hasSkus = product.skus && product.skus.length > 0

  const getDisplayImage = () => {
    const selectedEntries = Object.entries(selectedSkus)
    if (selectedEntries.length === 1) {
      const sku = product.skus.find(s => s.id === Number(selectedEntries[0][0]))
      if (sku && sku.image) return sku.image
    }
    return product.image
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!contentInput || contentInput.trim().length < 3) {
      setReviewError(t('product.review_error_min'))
      return
    }
    setReviewError('')
    setReviewSuccess('')
    setSubmittingReview(true)
    try {
      const res = await api.post(`/products/${id}/reviews`, {
        rating: ratingInput,
        content: contentInput,
      })

      const newReview = res.data.review
      setReviews(prev => [newReview, ...prev])
      setReviewSuccess(t('product.review_success'))
      setContentInput('')
      setRatingInput(5)

      setProduct(prev => {
        if (!prev) return prev
        const newCount = prev.reviewsCount + 1
        const totalRating = (prev.rating * prev.reviewsCount) + ratingInput
        const newRating = Number((totalRating / newCount).toFixed(1))
        return { ...prev, rating: newRating, reviewsCount: newCount }
      })
    } catch (err) {
      console.error(err)
      setReviewError(err.response?.data?.message || t('product.review_error'))
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back_home')}</span>
        </Link>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
          {/* Left Column: Image */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            <div className="aspect-square w-full max-w-md rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
              <img
                src={getDisplayImage()}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>
            <button className="absolute top-4 right-4 bg-white p-3 rounded-full text-slate-500 hover:text-red-500 shadow-md transition-colors">
              <Heart className="w-6 h-6" />
            </button>
          </div>

          {/* Right Column: Info & Actions */}
          <div className="lg:col-span-6 text-left space-y-6">
            <div className="space-y-2">
              <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full capitalize">
                {product.category}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {localized(product, 'name')}
              </h1>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="font-bold">{product.rating}</span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">{t('product.reviews_count', { count: product.reviewsCount })}</span>
              </div>
            </div>

            {/* Price Block */}
            {!hasSkus ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-extrabold text-indigo-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-slate-400 text-lg line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-green-600 font-semibold">{t('product.vat_included')}</p>
              </div>
            ) : (
              <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/60 space-y-2">
                <div className="flex flex-col">
                  <span className="text-xs text-indigo-700 font-bold uppercase tracking-wider">{t('product.estimated_total')}</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-indigo-600">
                      {formatPrice(getSelectedTotal())}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{t('product.skus_selected', { count: Object.keys(selectedSkus).length })}</span>
                  </div>
                </div>
              </div>
            )}

            {/* SKU Selection Section */}
            {hasSkus && (
              <div className="space-y-4 pt-2">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center justify-between">
                  <span>{t('product.select_skus')}</span>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{t('product.multi_select')}</span>
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {product.skus.map((sku) => {
                    const isSelected = sku.id in selectedSkus
                    const qty = selectedSkus[sku.id] || 0
                    const skuImg = sku.image || product.image

                    return (
                      <div
                        key={sku.id}
                        onClick={() => sku.stock > 0 && handleToggleSku(sku.id)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                          sku.stock === 0
                            ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                            : isSelected
                              ? 'border-indigo-600 bg-indigo-50/20 shadow-sm shadow-indigo-100'
                              : 'border-slate-200 hover:bg-slate-50 bg-white'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>

                        <img
                          src={skuImg}
                          alt={sku.name}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-100 flex-shrink-0"
                        />

                        <div className="flex-grow text-left">
                          <p className="font-bold text-slate-800 text-sm md:text-base leading-snug">{localized(sku, 'name')}</p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {sku.sku}</p>
                          <p className={`text-xs font-semibold mt-1 ${sku.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {sku.stock > 0 ? t('product.in_stock', { count: sku.stock }) : t('product.out_of_stock')}
                          </p>
                        </div>

                        <div
                          className="flex flex-col items-end gap-2 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="text-right">
                            <span className="font-extrabold text-indigo-600 text-sm md:text-base">
                              {formatPrice(sku.price)}
                            </span>
                            {sku.original_price > sku.price && (
                              <p className="text-[10px] text-slate-400 line-through">
                                {formatPrice(sku.original_price)}
                              </p>
                            )}
                          </div>

                          <div
                            className={`flex items-center border rounded-full px-2 py-0.5 bg-slate-50 ${
                              isSelected ? 'border-slate-300 opacity-100' : 'border-slate-200 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <button
                              disabled={!isSelected}
                              onClick={() => handleQuantityChange(sku.id, -1)}
                              className="p-1 text-slate-500 hover:text-slate-900 transition-colors disabled:pointer-events-none"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold text-xs w-6 text-center">{qty}</span>
                            <button
                              disabled={!isSelected}
                              onClick={() => handleQuantityChange(sku.id, 1)}
                              className="p-1 text-slate-500 hover:text-slate-900 transition-colors disabled:pointer-events-none"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Policy Badges */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100 text-xs text-slate-600">
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>{t('product.warranty')}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <span>{t('product.delivery')}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="w-5 h-5 text-indigo-600" />
                <span>{t('product.return_policy')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                onClick={handleAddToCart}
                variant="outline"
                className="flex-grow border-slate-300 text-slate-800 hover:bg-slate-50 font-bold py-6 rounded-2xl gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {t('product.add_to_cart')}
              </Button>
              <Button
                onClick={handleBuyNow}
                className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-2xl shadow-lg shadow-indigo-600/25"
              >
                {t('product.buy_now')}
              </Button>
            </div>

            {/* Description */}
            <div className="space-y-4 pt-4">
              <h3 className="font-extrabold text-lg text-slate-900 border-b border-slate-100 pb-2">{t('product.description')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {localized(product, 'description')}
              </p>
            </div>
          </div>
        </div>

        {/* Specifications Table */}
        <div className="mt-12 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm text-left">
          <h3 className="font-extrabold text-xl text-slate-900 mb-6">{t('product.specs')}</h3>
          <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 max-w-3xl">
            {Object.entries(localized(product, 'specs') || product.specs).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 p-4 text-sm hover:bg-slate-50">
                <span className="font-semibold text-slate-500">{t(`product.spec_${key}`, { defaultValue: key })}</span>
                <span className="col-span-2 text-slate-800 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm text-left">
          <div className="border-b border-slate-100 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-2xl text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-indigo-600" />
                <span>{t('product.reviews_title')}</span>
              </h3>
              <p className="text-slate-500 text-sm mt-1">{t('product.reviews_subtitle')}</p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 self-start md:self-auto">
              <div className="text-center border-r border-slate-200 pr-4">
                <span className="text-3xl font-black text-slate-800">{product.rating}</span>
                <span className="text-xs text-slate-400 block font-semibold mt-0.5">{t('product.rating_out_of')}</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-amber-500 stroke-amber-500' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-bold mt-1">{t('product.rating_count', { count: product.reviewsCount })}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Col: Review Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <h4 className="font-extrabold text-lg text-slate-900 mb-4">{t('product.write_review')}</h4>

                {user ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('product.rating_label')}</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingInput(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 rounded-md transition-transform hover:scale-110 focus:outline-none"
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                star <= (hoverRating || ratingInput)
                                  ? 'fill-amber-500 stroke-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-sm font-bold text-slate-600 ml-2">
                          {getRatingLabel(hoverRating || ratingInput)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('product.review_content_label')}</label>
                      <textarea
                        rows="4"
                        placeholder={t('product.review_placeholder')}
                        value={contentInput}
                        onChange={(e) => setContentInput(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none bg-white transition-all shadow-inner"
                        required
                      ></textarea>
                    </div>

                    {reviewError && (
                      <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                        {reviewError}
                      </p>
                    )}

                    {reviewSuccess && (
                      <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2 font-medium">
                        {reviewSuccess}
                      </p>
                    )}

                    <Button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-md shadow-indigo-600/10 transition-all"
                    >
                      {submittingReview ? t('product.review_submitting') : t('product.review_submit')}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-6 px-4 space-y-4">
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {t('product.login_to_review')}
                    </p>
                    <Button
                      onClick={() => setLoginModalOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 font-bold px-6 py-2.5 rounded-xl shadow-md"
                    >
                      {t('product.login_now')}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Reviews List */}
            <div className="lg:col-span-7 space-y-4">
              {reviewsLoading ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                  <p className="text-slate-400 text-sm">{t('product.reviews_loading')}</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/30 border border-dashed border-slate-200 rounded-2xl">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm font-medium">{t('product.no_reviews')}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t('product.be_first_review')}</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2 hover:border-slate-200 transition-all text-left">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-xs uppercase">
                            {rev.user_name ? rev.user_name.substring(0, 2) : 'KH'}
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-slate-800 block leading-tight">{rev.user_name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(rev.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-500 stroke-amber-500' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed font-medium pl-10 whitespace-pre-line">
                        {rev.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      </div>
    </div>
  )
}
