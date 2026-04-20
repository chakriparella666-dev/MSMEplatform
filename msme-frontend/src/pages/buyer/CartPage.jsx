import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaArrowLeft, FaTrash, FaShoppingBag } from 'react-icons/fa'
import BuyerNavbar from '../../components/BuyerNavbar'

export default function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCart() }, [])

  const fetchCart = async () => {
    try {
      const { data } = await axios.get('/api/cart', { withCredentials: true })
      setCart(data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const updateQuantity = async (productId, size, quantity, maxStock) => {
    if (quantity > maxStock) return
    try {
      const { data } = await axios.put('/api/cart/update', { productId, size, quantity }, { withCredentials: true })
      if (data.success) fetchCart()
      else alert(data.message)
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update quantity')
    }
  }

  const removeItem = async (productId, size) => {
    try {
      await axios.delete(`/api/cart/remove`, { data: { productId, size }, withCredentials: true })
      fetchCart()
    } catch (err) { console.error(err) }
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div style={{ width: '40px', height: '40px', border: '4px solid #ddd', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div></div>

  const subtotal = cart?.items?.reduce((acc, i) => acc + (i.product?.price || 0) * i.quantity, 0) || 0
  const isEmpty = !cart?.items?.length

  return (
    <div style={{ background: '#f8f9fc', minHeight: '100vh' }}>
      <BuyerNavbar />
      
      <div style={{ padding: '24px 40px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/buyer')} style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <FaArrowLeft /> Continue Shopping
        </button>
        <h1 style={{ color: 'var(--primary-dark)', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>My Cart ({cart?.items?.length || 0} items)</h1>
      </div>

      <div style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
        {/* Cart Items */}
        <div>
          {isEmpty ? (
            <div style={{ background: 'white', borderRadius: '20px', padding: '80px', textAlign: 'center', border: '1px solid #eee' }}>
              <FaShoppingBag size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
              <h2 style={{ color: '#475569' }}>Your cart is empty</h2>
              <button className="btn-primary" style={{ marginTop: '24px' }} onClick={() => navigate('/buyer')}>Start Shopping</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.items.map((item) => {
                const availableStock = item.product?.sizes?.find(s => s.size === item.size)?.stock ?? 99
                return (
                <div key={`${item.product?._id}-${item.size}`} style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eee', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <img
                    src={item.product?.images?.[0] || 'https://via.placeholder.com/100'}
                    style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '12px', background: '#f8fafc', border: '1px solid #eee' }}
                    onError={e => e.target.src = 'https://via.placeholder.com/100'}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{item.product?.category}</div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{item.product?.name}</h3>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>Size: {item.size}</span>
                      <span style={{ background: availableStock === 0 ? '#fee2e2' : '#fef3c7', color: availableStock === 0 ? '#dc2626' : '#92400e', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                        {availableStock === 0 ? '⚠ Out of Stock' : `In Stock: ${availableStock}`}
                      </span>
                    </div>
                    {item.quantity > availableStock && (
                      <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, marginBottom: '8px' }}>⚠ Cart exceeds available stock</div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                        <button onClick={() => item.quantity > 1 ? updateQuantity(item.product._id, item.size, item.quantity - 1, availableStock) : removeItem(item.product._id, item.size)} style={{ padding: '6px 12px', background: '#f8fafc', border: 'none', cursor: 'pointer', fontWeight: 800 }}>−</button>
                        <span style={{ padding: '6px 16px', fontWeight: 800 }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.size, item.quantity + 1, availableStock)}
                          disabled={item.quantity >= availableStock}
                          style={{ padding: '6px 12px', background: item.quantity >= availableStock ? '#f1f5f9' : '#f8fafc', border: 'none', cursor: item.quantity >= availableStock ? 'not-allowed' : 'pointer', fontWeight: 800, color: item.quantity >= availableStock ? '#cbd5e1' : 'inherit' }}
                        >+</button>
                      </div>
                      <button onClick={() => removeItem(item.product._id, item.size)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                        <FaTrash size={12} /> Remove
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>₹{item.product?.price?.toLocaleString()} each</div>
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Order Summary */}
        {!isEmpty && (
          <div>
            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #eee', position: 'sticky', top: '20px' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>Price Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>Price ({cart.items.length} items)</span>
                  <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>Delivery Charges</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>FREE</span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Total Amount</span>
                <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>₹{subtotal.toLocaleString()}</span>
              </div>
              <div style={{ background: '#f0fdf4', padding: '10px 16px', borderRadius: '8px', marginBottom: '20px', color: '#166534', fontSize: '0.85rem', fontWeight: 700 }}>
                🎉 You're getting FREE delivery on this order!
              </div>
              <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem', fontWeight: 800, borderRadius: '12px' }} onClick={() => navigate('/checkout')}>
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
