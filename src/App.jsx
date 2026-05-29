import { Routes, Route, Outlet } from 'react-router-dom'
import ShopLayout from './components/layout/ShopLayout'
import AdminLayout from './components/layout/AdminLayout'

// Shop pages
import Home from './pages/shop/Home'
import ProductDetail from './pages/shop/ProductDetail'
import Cart from './pages/shop/Cart'
import Checkout from './components/shop/Checkout'
import Orders from './pages/shop/Orders'
import Profile from './pages/shop/Profile'
import Search from './pages/shop/Search'
import VNPaySimulator from './pages/shop/VNPaySimulator'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminOrders from './pages/admin/AdminOrders'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminStaff from './pages/admin/AdminStaff'
import AdminVouchers from './pages/admin/AdminVouchers'

// Layout wrappers using React Router v6 Outlet
const ShopLayoutWrapper = () => (
  <ShopLayout>
    <Outlet />
  </ShopLayout>
)

const AdminLayoutWrapper = () => (
  <AdminLayout>
    <Outlet />
  </AdminLayout>
)

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      <Routes>
        {/* Shop/Customer Route Group */}
        <Route element={<ShopLayoutWrapper />}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<Search />} />
        </Route>

        {/* Admin Route Group */}
        <Route element={<AdminLayoutWrapper />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/staff" element={<AdminStaff />} />
          <Route path="/admin/vouchers" element={<AdminVouchers />} />
        </Route>

        {/* Simulator - No Layout */}
        <Route path="/vnpay-simulator" element={<VNPaySimulator />} />
      </Routes>
    </div>
  )
}

export default App

