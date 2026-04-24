import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/dashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import SellerDashboard from './pages/seller/SellerDashboard'
import BuyerDashboard from './pages/buyer/BuyerDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProductDetail from './pages/buyer/ProductDetail'
import CartPage from './pages/buyer/CartPage'
import Checkout from './pages/buyer/Checkout'
import OrderSuccess from './pages/buyer/OrderSuccess'
import MyOrders from './pages/buyer/MyOrders'
import Addresses from './pages/buyer/Addresses'
import Wishlist from './pages/buyer/Wishlist'
import Profile from './pages/buyer/Profile'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import ErrorBoundary from './components/ErrorBoundary'

function RouteWithTitle({ element, title }) {
  useEffect(() => {
    if (title) document.title = `${title} | MSMEMarket`
  }, [title])
  return element
}
RouteWithTitle.propTypes = {
  element: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
}

function App() {
  return (
    <AuthProvider>
      <PWAInstallPrompt />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Navigate to="/buyer" replace />} />
          <Route path="/login" element={<RouteWithTitle element={<Login />} title="Login" />} />
          <Route path="/register" element={<RouteWithTitle element={<Register />} title="Register" />} />
          <Route path="/dashboard" element={<Navigate to="/buyer" replace />} />

          {/* Buyer Routes */}
          <Route path="/buyer" element={<RouteWithTitle element={<BuyerDashboard />} title="Shop" />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<RouteWithTitle element={<CartPage />} title="Cart" />} />
          <Route path="/checkout" element={<RouteWithTitle element={<Checkout />} title="Checkout" />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/my-orders" element={<RouteWithTitle element={<MyOrders />} title="My Orders" />} />
          <Route path="/addresses" element={<RouteWithTitle element={<Addresses />} title="Addresses" />} />
          <Route path="/wishlist" element={<RouteWithTitle element={<Wishlist />} title="Wishlist" />} />
          <Route path="/profile" element={<RouteWithTitle element={<Profile />} title="Profile" />} />

          {/* Workspace Routes */}
          <Route path="/seller" element={<RouteWithTitle element={<SellerDashboard />} title="Seller Hub" />} />
          <Route path="/admin" element={<RouteWithTitle element={<AdminDashboard />} title="Admin" />} />

          <Route path="/forgot-password" element={<RouteWithTitle element={<ForgotPassword />} title="Forgot Password" />} />
          <Route path="/reset-password/:token" element={<RouteWithTitle element={<ResetPassword />} title="Reset Password" />} />

          {/* Catch-all for undefined routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ErrorBoundary>
    </AuthProvider>
  )
}

export default App;
