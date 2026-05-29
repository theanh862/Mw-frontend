import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Heart, Smartphone, Laptop, Tablet, Watch, ShieldCheck, Truck, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { localized } from '@/lib/localize'
import api from '@/lib/api'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)

  // Fetch categories on mount
  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Error fetching categories:', err))
  }, [])

  // Fetch products when selectedCategory changes
  useEffect(() => {
    setLoading(true)
    const url = selectedCategory === 'all' 
      ? '/products' 
      : `/products?category=${selectedCategory}`
    
    api.get(url)
      .then(res => {
        // Map database fields (snake_case) to frontend fields (camelCase)
        const mapped = res.data.map(p => ({
          ...p,
          originalPrice: p.original_price,
          reviewsCount: p.reviews_count,
        }))
        setProducts(mapped)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching products:', err)
        setLoading(false)
      })
  }, [selectedCategory])

  // Map category IDs to Lucide Icons dynamically
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className="w-6 h-6" />
      case 'Laptop': return <Laptop className="w-6 h-6" />
      case 'Tablet': return <Tablet className="w-6 h-6" />
      default: return <Watch className="w-6 h-6" />
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  return (
    <div className="pb-16 bg-slate-50">
      {/* Hero Showcase Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white py-16 md:py-24 px-4 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffd400_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 relative z-10">
          <div className="space-y-6 text-left">
            <span className="inline-block bg-[#ffd400]/20 text-[#ffd400] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              {t('home.badge')}
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              {t('home.hero_title')} <br />
              <span className="text-[#ffd400]">{t('home.hero_subtitle')}</span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg max-w-lg leading-relaxed">
              {t('home.hero_desc')}
            </p>
            <div className="flex gap-4 pt-2">
              <Button onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })} className="bg-[#ffd400] text-black hover:bg-[#ffd400]/90 font-bold px-8 py-6 rounded-full text-base shadow-lg shadow-[#ffd400]/25 transition-transform hover:-translate-y-0.5">
                {t('home.buy_now')}
              </Button>
              <Button variant="outline" className="border-slate-700 text-black transition-transform hover:-translate-y-0.5 font-bold px-8 py-6 rounded-full text-base">
                {t('home.learn_more')}
              </Button>
            </div>
          </div>
          <div className="hidden md:flex justify-center relative">
            <div className="absolute w-72 h-72 bg-indigo-500/25 rounded-full blur-3xl -top-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600" 
              alt="Hero showcase smartphone" 
              className="w-80 h-[420px] object-cover rounded-[2.5rem] shadow-2xl border-4 border-slate-700/50 transform rotate-6 transition-transform hover:rotate-3 duration-500"
            />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 -translate-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
          <div className="flex items-center gap-4 p-3 border-r border-slate-100 last:border-0">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">{t('home.trust_1_title')}</h4>
              <p className="text-xs text-slate-500">{t('home.trust_1_desc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 border-r border-slate-100 last:border-0">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">{t('home.trust_2_title')}</h4>
              <p className="text-xs text-slate-500">{t('home.trust_2_desc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">{t('home.trust_3_title')}</h4>
              <p className="text-xs text-slate-500">{t('home.trust_3_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900">{t('home.categories_title')}</h2>
          <p className="text-slate-500 max-w-md">{t('home.categories_desc')}</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full px-6 py-5 ${
              selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            {t('home.all_products')}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.slug ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`rounded-full px-6 py-5 gap-2 ${
                selectedCategory === cat.slug 
                  ? 'bg-slate-900 text-white' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              {getIcon(cat.icon)}
              {localized(cat, 'name')}
            </Button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section id="products-section" className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-medium">
            {t('home.no_products')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => {
            const discountPercentage = Math.round(
              ((product.originalPrice - product.price) / product.originalPrice) * 100
            )

            return (
              <div 
                key={product.id} 
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col h-full relative"
              >
                {/* Discount Badge */}
                {discountPercentage > 0 && (
                  <span className="absolute top-4 left-4 z-10 bg-red-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                    -{discountPercentage}%
                  </span>
                )}
                
                {/* Product Image Wrapper */}
                <div className="relative aspect-square overflow-hidden bg-slate-50 cursor-pointer">
                  <Link to={`/product/${product.id}`}>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <button className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full text-slate-500 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-6 flex flex-col flex-grow text-left space-y-3">
                  <div className="flex items-center gap-1 text-amber-500 text-sm">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span className="font-bold text-slate-800">{product.rating}</span>
                    <span className="text-slate-400 text-xs">({product.reviewsCount} {t('home.reviews')})</span>
                  </div>
                  
                  <Link to={`/product/${product.id}`} className="block">
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 text-base leading-snug">
                      {localized(product, 'name')}
                    </h3>
                  </Link>

                  {/* Price Block */}
                  <div className="space-y-1">
                    <div className="text-indigo-600 font-extrabold text-lg">
                      {formatPrice(product.price)}
                    </div>
                    {product.originalPrice > product.price && (
                      <div className="text-slate-400 text-sm line-through">
                        {formatPrice(product.originalPrice)}
                      </div>
                    )}
                  </div>

                  {/* Description Preview */}
                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                    {localized(product, 'description')}
                  </p>

                  {/* Action Button */}
                  <div className="pt-3 mt-auto">
                    <Button 
                      onClick={() => addItem(product)}
                      className="w-full bg-slate-900 hover:bg-[#ffd400] hover:text-black font-bold py-5 rounded-2xl transition-colors gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {t('home.add_to_cart')}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
          </div>
        )}
      </section>
    </div>
  )
}
