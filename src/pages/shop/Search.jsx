import React, { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Search as SearchIcon, Star, ShoppingCart, Loader2, PackageSearch, X, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { localized } from '@/lib/localize'
import { useCartStore } from '@/store/useCartStore'
import api from '@/lib/api'

export default function Search() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const [inputVal, setInputVal] = useState(query)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('created_at')
  const addItem = useCartStore(s => s.addItem)

  const formatPrice = (p) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p)

  const fetchResults = useCallback(async (q, sort) => {
    if (!q.trim()) { setProducts([]); return }
    setLoading(true)
    try {
      const res = await api.get('/products', { params: { search: q, sort_by: sort } })
      setProducts(res.data.map(p => ({ ...p, originalPrice: p.original_price, reviewsCount: p.reviews_count })))
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setInputVal(query)
    fetchResults(query, sortBy)
  }, [query, sortBy, fetchResults])

  const handleSearch = (e) => {
    e.preventDefault()
    if (inputVal.trim()) setSearchParams({ q: inputVal.trim() })
  }

  const handleQuickAdd = (e, product) => {
    e.preventDefault()
    const cheapestSku = product.skus?.slice().sort((a, b) => a.price - b.price)[0]
    addItem(product, cheapestSku || null, 1)
  }

  const SORTS = [
    { value: 'created_at', label: i18n.language === 'vi' ? 'Mới nhất' : 'Newest' },
    { value: 'price',      label: i18n.language === 'vi' ? 'Giá thấp → cao' : 'Price: Low → High' },
  ]

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-2xl">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder={i18n.language === 'vi' ? 'Tìm kiếm sản phẩm...' : 'Search products...'}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
              autoFocus
            />
            {inputVal && (
              <button type="button" onClick={() => { setInputVal(''); navigate('/search') }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button type="submit"
            className="bg-slate-900 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-2xl text-sm transition-colors">
            {i18n.language === 'vi' ? 'Tìm' : 'Search'}
          </button>
        </form>

        {/* Header row */}
        {query && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-slate-500">
              {loading ? (
                <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" />{i18n.language === 'vi' ? 'Đang tìm...' : 'Searching...'}</span>
              ) : (
                <>
                  {i18n.language === 'vi'
                    ? <><span className="font-bold text-slate-800">"{query}"</span> — {products.length} kết quả</>
                    : <><span className="font-bold text-slate-800">"{query}"</span> — {products.length} result{products.length !== 1 ? 's' : ''}</>
                  }
                </>
              )}
            </p>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <SlidersHorizontal className="w-4 h-4" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="border border-slate-200 rounded-xl px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!query && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <SearchIcon className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-semibold">{i18n.language === 'vi' ? 'Nhập từ khoá để tìm kiếm' : 'Type something to search'}</p>
          </div>
        )}

        {/* No results */}
        {query && !loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <PackageSearch className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-semibold mb-1">
              {i18n.language === 'vi' ? 'Không tìm thấy sản phẩm nào' : 'No products found'}
            </p>
            <p className="text-sm">{i18n.language === 'vi' ? 'Thử từ khoá khác nhé' : 'Try a different keyword'}</p>
          </div>
        )}

        {/* Results grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => {
              const minPrice = product.skus?.length
                ? Math.min(...product.skus.map(s => s.price))
                : product.price
              const hasDiscount = product.original_price && product.original_price > minPrice

              return (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-50">
                    <img
                      src={product.image}
                      alt={localized(product, 'name')}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                        -{Math.round((1 - minPrice / product.original_price) * 100)}%
                      </span>
                    )}
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-indigo-600 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3">
                    <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-2">
                      {localized(product, 'name')}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-extrabold text-indigo-600">{formatPrice(minPrice)}</p>
                        {hasDiscount && (
                          <p className="text-xs text-slate-400 line-through">{formatPrice(product.original_price)}</p>
                        )}
                      </div>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-0.5 text-amber-400">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-semibold text-slate-600">{Number(product.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
