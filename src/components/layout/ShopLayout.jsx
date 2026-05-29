import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, LogOut, ChevronDown, LayoutDashboard, LogIn, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import LoginModal from '@/components/shop/LoginModal'
import NotificationBell from '@/components/shop/NotificationBell'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ShopLayout({ children }) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { user, logout, token, fetchUser } = useAuthStore()
  const { items } = useCartStore()
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0)
  const [loginOpen, setLoginOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    const q = searchVal.trim()
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  useEffect(() => {
    if (token && !user) {
      fetchUser()
    }
  }, [token, user, fetchUser])

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('lang', lng)
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Banner */}
      <div className="bg-[#ffd400] text-black text-center text-xs font-semibold py-1.5 px-4 hidden md:block">
        {t('nav.banner')}
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-[#1e293b] text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="bg-[#ffd400] text-black font-extrabold px-3 py-1.5 rounded-lg text-lg tracking-wider shadow-sm transition-transform hover:scale-105">
              Mobile<span className="text-slate-800">World</span>
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-grow max-w-xl relative hidden md:block">
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder={t('nav.search_desktop')}
              className="w-full pl-4 pr-10 py-2 rounded-full bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ffd400] focus:border-transparent transition-all text-sm"
            />
            <button type="submit" className="absolute right-3.5 top-2.5">
              <Search className="text-slate-400 w-4 h-4 hover:text-[#ffd400]" />
            </button>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-3">

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 p-2 text-slate-300 hover:text-[#ffd400] transition-colors focus:outline-none">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-bold hidden sm:inline">{i18n.language === 'vi' ? 'VI' : 'EN'}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 mt-1">
                <DropdownMenuItem onClick={() => changeLanguage('vi')} className={`cursor-pointer ${i18n.language === 'vi' ? 'font-bold text-indigo-600' : ''}`}>
                  🇻🇳 Tiếng Việt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('en')} className={`cursor-pointer ${i18n.language === 'en' ? 'font-bold text-indigo-600' : ''}`}>
                  🇬🇧 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notification Bell */}
            {user && <NotificationBell />}

            {/* Cart Button */}
            <Link to="/cart" className="relative p-2 text-slate-300 hover:text-[#ffd400] transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Admin panel shortcut */}
            {(user?.role === 'admin' || user?.role === 'staff') && (
              <Button
                variant="ghost"
                onClick={() => navigate('/admin')}
                className="text-slate-300 hover:text-[#ffd400] hover:bg-slate-800 gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.admin')}</span>
              </Button>
            )}

            {/* Auth / Profile Area */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-800 transition-colors focus:outline-none">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-slate-600 bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="text-sm font-medium hidden sm:inline max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 mt-1">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    {t('nav.my_profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')} className="cursor-pointer">
                    {t('nav.my_orders')}
                  </DropdownMenuItem>
                  {(user.role === 'admin' || user.role === 'staff') && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer">
                      {t('nav.admin_page')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer focus:bg-red-50">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setLoginOpen(true)}
                className="gap-2 bg-[#ffd400] text-black font-semibold hover:bg-yellow-400 border-0"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.login')}</span>
              </Button>
            )}

          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="container mx-auto px-4 pb-3 block md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder={t('nav.search_mobile')}
              className="w-full pl-4 pr-10 py-2 rounded-full bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ffd400] focus:border-transparent text-sm"
            />
            <button type="submit" className="absolute right-3.5 top-2.5">
              <Search className="text-slate-400 w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />

      {/* Main Content Area */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-base mb-4">{t('nav.footer.about')}</h3>
            <p className="leading-relaxed">{t('nav.footer.about_text')}</p>
          </div>
          <div>
            <h3 className="text-white font-bold text-base mb-4">{t('nav.footer.support')}</h3>
            <ul className="space-y-2">
              <li><Link to="/policy/shipping" className="hover:text-[#ffd400] transition-colors">{t('nav.footer.shipping_policy')}</Link></li>
              <li><Link to="/policy/warranty" className="hover:text-[#ffd400] transition-colors">{t('nav.footer.warranty_policy')}</Link></li>
              <li><Link to="/policy/return" className="hover:text-[#ffd400] transition-colors">{t('nav.footer.return_policy')}</Link></li>
              <li><Link to="/faq" className="hover:text-[#ffd400] transition-colors">{t('nav.footer.faq')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-base mb-4">{t('nav.footer.categories')}</h3>
            <ul className="space-y-2">
              <li><Link to="/category/phone" className="hover:text-[#ffd400] transition-colors">{t('nav.footer.phone')}</Link></li>
              <li><Link to="/category/laptop" className="hover:text-[#ffd400] transition-colors">{t('nav.footer.laptop')}</Link></li>
              <li><Link to="/category/tablet" className="hover:text-[#ffd400] transition-colors">{t('nav.footer.tablet')}</Link></li>
              <li><Link to="/category/accessories" className="hover:text-[#ffd400] transition-colors">{t('nav.footer.accessories')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-base mb-4">{t('nav.footer.contact')}</h3>
            <p className="mb-2">{t('nav.footer.hotline')}: <span className="text-[#ffd400] font-semibold">1800.1060</span></p>
            <p className="mb-2">{t('nav.footer.complaint')}: <span className="text-[#ffd400] font-semibold">1800.1062</span></p>
            <p>{t('nav.footer.address')}</p>
          </div>
        </div>
        <div className="bg-slate-950 py-4 text-center text-xs border-t border-slate-900">
          <p>{t('nav.footer.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}
