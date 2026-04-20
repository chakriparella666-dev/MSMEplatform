import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaArrowLeft, FaBox, FaTruck, FaCheckCircle, FaShippingFast } from 'react-icons/fa'
import BuyerNavbar from '../../components/BuyerNavbar'

const statusSteps = ['Ordered', 'Dispatched', 'Shipped', 'Delivered']

const statusIcon = { Ordered: <FaBox />, Dispatched: <FaShippingFast />, Shipped: <FaTruck />, Delivered: <FaCheckCircle /> }

export default function MyOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders/my-orders', { withCredentials: true })
      setOrders(data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const statusColor = {
    Ordered: { bg: '#dbeafe', text: '#1d4ed8' },
    Dispatched: { bg: '#fef3c7', text: '#d97706' },
    Shipped: { bg: '#e0f2fe', text: '#0369a1' },
    Delivered: { bg: '#dcfce7', text: '#166534' },
    Cancelled: { bg: '#fee2e2', text: '#dc2626' },
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #ddd', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    </div>
  )

  return (
    <div style={{ background: '#f8f9fc', minHeight: '100vh' }}>
      <BuyerNavbar />
      
      <div style={{ padding: '24px 40px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/buyer')} style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <FaArrowLeft /> Back to Store
        </button>
        <span style={{ color: '#94a3b8' }}>›</span>
        <h1 style={{ color: 'var(--primary-dark)', margin: 0, fontWeight: 800, fontSize: '1.5rem' }}>My Orders</h1>
      </div>

      <div style={{ maxWidth: '900px', margin: '32px auto', padding: '0 20px' }}>
        {orders.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '20px', padding: '80px', textAlign: 'center', border: '1px solid #eee' }}>
            <FaBox size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#475569' }}>No orders yet</h2>
            <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/buyer')}>Start Shopping</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map(order => (
              <div key={order._id} style={{ background: 'white', borderRadius: '20px', border: '1px solid #eee', overflow: 'hidden' }}>
                {/* Order Header */}
                <div style={{ padding: '20px 28px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>ORDER ID </span>
                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>#{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span style={{ ...statusColor[order.status], padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, background: statusColor[order.status]?.bg, color: statusColor[order.status]?.text }}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Products */}
                <div style={{ padding: '20px 28px' }}>
                  {order.products.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', paddingBottom: '16px', marginBottom: i < order.products.length - 1 ? '16px' : 0, borderBottom: i < order.products.length - 1 ? '1px dashed #eee' : 'none' }}>
                      <img
                        src={item.product?.images?.[0] || 'https://via.placeholder.com/72'}
                        style={{ width: '72px', height: '72px', objectFit: 'contain', borderRadius: '10px', background: '#f8fafc', border: '1px solid #eee' }}
                        onError={e => e.target.src = 'https://via.placeholder.com/72'}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, marginBottom: '4px' }}>{item.product?.name || 'Product'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Size: {item.size} | Qty: {item.quantity}</div>
                        <div style={{ fontWeight: 800, marginTop: '8px' }}>₹{((item.price || item.product?.price || 5999) * item.quantity).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking */}
                <div style={{ padding: '20px 28px', background: '#fafafa', borderTop: '1px solid #eee' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#374151', marginBottom: '16px' }}>Order Tracking</div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0' }}>
                    {statusSteps.map((s, i) => {
                      const currentIdx = statusSteps.indexOf(order.status)
                      const isDone = i <= currentIdx
                      const isCurrent = i === currentIdx
                      return (
                        <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                          {i < statusSteps.length - 1 && (
                            <div style={{ position: 'absolute', top: '16px', right: '-50%', width: '100%', height: '2px', background: isDone && i < currentIdx ? 'var(--primary)' : '#e2e8f0', zIndex: 0 }}></div>
                          )}
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isDone ? 'var(--primary)' : '#e2e8f0', color: isDone ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, fontSize: '0.875rem', border: isCurrent ? '3px solid #bfdbfe' : 'none' }}>
                            {statusIcon[s]}
                          </div>
                          <div style={{ fontSize: '0.7rem', fontWeight: isCurrent ? 800 : 600, color: isDone ? 'var(--primary)' : '#94a3b8', marginTop: '8px', textAlign: 'center' }}>{s}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Delivery Address & Total */}
                <div style={{ padding: '16px 28px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Delivering to</div>
                    <div style={{ fontWeight: 700 }}>{order.shippingAddress?.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>{order.shippingAddress?.street}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}</div>
                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>{order.shippingAddress?.phone}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Order Total</div>
                    <div style={{ fontWeight: 900, fontSize: '1.25rem' }}>₹{order.totalAmount?.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
