import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  ListCollapse,
  ClipboardList,
  Users,
  Home,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Globe,
  Tag
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import NotificationBell from '@/components/shop/NotificationBell'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { key: 'dashboard', path: '/admin', icon: LayoutDashboard, role: 'admin' },
    { key: 'products', path: '/admin/products', icon: ShoppingBag },
    { key: 'categories', path: '/admin/categories', icon: ListCollapse },
    { key: 'orders', path: '/admin/orders', icon: ClipboardList },
    { key: 'customers', path: '/admin/customers', icon: Users, role: 'admin' },
    { key: 'staff', path: '/admin/staff', icon: ShieldCheck, role: 'admin' },
    { key: 'vouchers', path: '/admin/vouchers', icon: Tag },
  ]

  const allowedMenuItems = menuItems.filter(item => !item.role || item.role === user?.role)

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem('token')
      if (!token) navigate('/')
    } else {
      if (user.role !== 'admin' && user.role !== 'staff') {
        navigate('/')
      } else if (user.role === 'staff' && location.pathname === '/admin') {
        navigate('/admin/products')
      }
    }
  }, [user, location.pathname, navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('lang', lng)
  }

  const currentPageName = allowedMenuItems.find((item) => item.path === location.pathname)
  const pageTitle = currentPageName ? t(`admin.menu.${currentPageName.key}`) : t('admin.system_title')

  const SidebarNav = ({ onItemClick }) => (
    <>
      {allowedMenuItems.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.path
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-[#ffd400] text-black shadow-md font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {t(`admin.menu.${item.key}`)}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 font-sans overflow-hidden">

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white flex-shrink-0 border-r border-slate-800">
        <div className="p-5 flex items-center gap-2 border-b border-slate-800">
          <span className="bg-[#ffd400] text-black font-extrabold px-3 py-1.5 rounded-lg text-md tracking-wider">
            MW <span className="text-slate-800 font-bold">ADMIN</span>
          </span>
        </div>

        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          <SidebarNav />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 gap-3">
              <Home className="w-5 h-5" />
              {t('admin.view_shop')}
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20 gap-3"
          >
            <LogOut className="w-5 h-5" />
            {t('admin.logout')}
          </Button>
        </div>
      </aside>

      {/* Sidebar for Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm">
          <div className="w-64 bg-slate-900 text-white flex flex-col p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <span className="bg-[#ffd400] text-black font-extrabold px-3 py-1.5 rounded-lg text-md tracking-wider">
                MW ADMIN
              </span>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="text-white hover:bg-slate-800">
                <X className="w-6 h-6" />
              </Button>
            </div>
            <nav className="flex-grow space-y-1">
              <SidebarNav onItemClick={() => setSidebarOpen(false)} />
            </nav>
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <Link to="/" onClick={() => setSidebarOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 gap-3">
                  <Home className="w-5 h-5" />
                  {t('admin.view_shop')}
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20 gap-3"
              >
                <LogOut className="w-5 h-5" />
                {t('admin.logout')}
              </Button>
            </div>
          </div>
          <div className="flex-grow" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content Side */}
      <div className="flex flex-col flex-grow overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-600 hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-bold">{i18n.language === 'vi' ? 'VI' : 'EN'}</span>
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

            <NotificationBell variant="light" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="admin profile"
                      className="w-8 h-8 rounded-full border border-slate-200 bg-slate-100 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-slate-200 bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                  )}
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-semibold text-slate-800">{user?.name || 'Admin'}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user?.role || 'Admin'}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mt-1">
                <DropdownMenuItem onClick={() => navigate('/')} className="cursor-pointer">
                  <Home className="w-4 h-4 mr-2 text-slate-500" />
                  {t('admin.view_shop')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer focus:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('admin.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-grow p-6 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>

    </div>
  )
}
