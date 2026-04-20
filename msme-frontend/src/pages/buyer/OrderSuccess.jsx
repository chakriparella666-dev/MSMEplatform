import { useLocation, useNavigate } from 'react-router-dom'
import { FaCheckCircle, FaTruck } from 'react-icons/fa'

export default function OrderSuccess() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const order = state?.order

  return (
    <div style={{ background: '#f8f9fc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '60px 48px', textAlign: 'center', maxWidth: '520px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
        <div style={{ animation: 'spin 0s', marginBottom: '24px' }}>
          <FaCheckCircle size={72} color="#22c55e" />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#166534', marginBottom: '8px' }}>Order Confirmed!</h1>
        <p style={{ color: '#475569', marginBottom: '32px', lineHeight: 1.6 }}>
          Your order has been placed successfully. You'll receive a confirmation shortly.
        </p>

        {order && (
          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '24px', marginBottom: '32px', textAlign: 'left', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Order ID</span>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)' }}>#{order._id?.slice(-8).toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Amount</span>
              <span style={{ fontWeight: 800 }}>₹{order.totalAmount?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Status</span>
              <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>Order Confirmed</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#eff6ff', padding: '14px 20px', borderRadius: '12px', marginBottom: '32px' }}>
          <FaTruck color="var(--primary)" size={20} />
          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Expected Delivery: Tomorrow by 11 PM</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button className="btn-outline" style={{ padding: '14px' }} onClick={() => navigate('/my-orders')}>My Orders</button>
          <button className="btn-primary" style={{ padding: '14px' }} onClick={() => navigate('/buyer')}>Continue Shopping</button>
        </div>
      </div>
    </div>
  )
}
