import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaStar, FaShoppingCart, FaBolt, FaArrowLeft, FaCheck, FaShieldAlt, FaTruck, FaUndo, FaShoppingBag, FaHeart, FaRegHeart } from 'react-icons/fa'
import BuyerNavbar from '../../components/BuyerNavbar'

// Inline toast — no browser alert() ever
function Toast({ message, type }) {
  if (!message) return null
  const bg = type === 'error' ? '#fee2e2' : type === 'success' ? '#dcfce7' : '#eff6ff'
  const color = type === 'error' ? '#dc2626' : type === 'success' ? '#166534' : '#1d4ed8'
  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', background: bg, color, padding: '14px 20px', borderRadius: '12px', fontWeight: 700, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', maxWidth: '340px', animation: 'slideIn 0.3s ease' }}>
      {message}
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [selectedImg, setSelectedImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [added, setAdded] = useState(false)
  const [toast, setToast] = useState({ message: '', type: '' })
  const [isWished, setIsWished] = useState(false)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: '', type: '' }), 3000)
  }

  useEffect(() => { setAdded(false) }, [selectedSize, quantity])
  useEffect(() => { fetchProduct() }, [id])

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`/api/products/${id}`)
      setProduct(data.data)
      const firstInStock = data.data.sizes.find(s => s.stock > 0)
      if (firstInStock) setSelectedSize(firstInStock.size)
      
      // Also check wishlist status for user
      try {
        const wishRes = await axios.get('/api/user/wishlist', { withCredentials: true })
        if (wishRes.data.data.some(w => w._id === id || w === id)) setIsWished(true)
      } catch (err) { /* Not logged in or error */ }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const toggleWishlist = async () => {
    try {
      await axios.post('/api/user/wishlist/toggle', { productId: id }, { withCredentials: true })
      setIsWished(!isWished)
      showToast(isWished ? 'Removed from wishlist' : 'Added to wishlist ❤️', 'success')
    } catch (err) {
      showToast('Please log in to add to wishlist', 'error')
    }
  }

  const handleAddToCart = async () => {
    if (!selectedSize) return showToast('Please select a size first', 'error')
    const sizeStock = product.sizes.find(s => s.size === selectedSize)?.stock || 0
    if (sizeStock === 0) return showToast(`Size ${selectedSize} is out of stock`, 'error')
    setAddingToCart(true)
    try {
      await axios.post('/api/cart/add', { productId: id, quantity, size: selectedSize }, { withCredentials: true })
      setAdded(true)
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not add to cart. Please log in.'
      showToast(msg, 'error')
    }
    finally { setAddingToCart(false) }
  }

  const handleBuyNow = async () => {
    if (!selectedSize) return showToast('Please select a size first', 'error')
    const sizeStock = product.sizes.find(s => s.size === selectedSize)?.stock || 0
    if (sizeStock === 0) return showToast(`Size ${selectedSize} is out of stock`, 'error')
    try {
      await axios.post('/api/cart/add', { productId: id, quantity, size: selectedSize }, { withCredentials: true })
      navigate('/checkout')
    } catch (err) {
      const msg = err.response?.data?.message || 'Please log in to continue.'
      showToast(msg, 'error')
    }
  }

  // Cap quantity at selected size stock
  const selectedSizeStock = selectedSize ? (product?.sizes?.find(s => s.size === selectedSize)?.stock || 0) : 0

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid #ddd', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    </div>
  )

  if (!product) return <div style={{ textAlign: 'center', padding: '80px' }}>Product not found.</div>

  const totalStock = product.sizes.reduce((acc, s) => acc + s.stock, 0)

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      <BuyerNavbar />
      <Toast message={toast.message} type={toast.type} />

      {/* Breadcrumb Nav */}
      <div style={{ padding: '32px 40px 0', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
        <button onClick={() => navigate('/buyer')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 600, transition: 'var(--transition)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <FaArrowLeft size={12} /> Store
        </button>
        <span style={{ color: '#CBD5E1' }}>/</span>
        <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', fontWeight: 700 }}>{product.category}</span>
        <span style={{ color: '#CBD5E1' }}>/</span>
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{product.name}</span>
      </div>

      <div style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px' }}>
        {/* Left: Image Gallery */}
        <div>
          <div style={{ position: 'relative', marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', background: '#F8FAFC', height: '400px' }}>
            <div 
              onClick={toggleWishlist}
              style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10, background: 'white', borderRadius: '50%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isWished ? <FaHeart color="#ef4444" size={20} /> : <FaRegHeart color="var(--text-main)" size={20} />}
            </div>

            {totalStock === 0 && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                <span style={{ background: 'var(--text-main)', color: 'white', padding: '14px 32px', borderRadius: '4px', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Sold Out</span>
              </div>
            )}
            
            <img
              src={product.images[selectedImg] || 'https://via.placeholder.com/800?text=No+Image'}
              style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
              alt={product.name}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              onError={e => { e.target.src = 'https://via.placeholder.com/800?text=Error' }}
            />
          </div>

          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
              {product.images.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedImg(i)}
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: `2px solid ${i === selectedImg ? 'var(--text-main)' : 'transparent'}`,
                    transition: 'var(--transition)',
                    flexShrink: 0
                  }}
                >
                  <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = 'https://via.placeholder.com/100' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div style={{ paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{product.category}</span>
            <span style={{ color: '#CBD5E1' }}>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaStar color="#FFB800" size={12} />
              <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{product.rating || '4.5'}</span>
            </div>
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Sora', sans-serif", letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: '8px', color: 'var(--text-main)' }}>{product.name}</h1>
          
          <div style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '32px', fontWeight: 500 }}>
            by <strong style={{ color: 'var(--text-main)', fontWeight: 700 }}>{product.seller?.businessName || 'MSME Direct'}</strong>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'baseline', gap: '8px', fontFamily: "'Sora', sans-serif" }}>
              ₹{product.price.toLocaleString()}
              <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inc. of all taxes</span>
            </div>
          </div>

          {/* Size Selector */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Select Size</span>
              <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>Size Guide</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '8px' }}>
              {product.sizes.map(s => (
                <button
                  key={s.size}
                  onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                  disabled={s.stock === 0}
                  style={{
                    height: '44px',
                    borderRadius: '6px',
                    border: '1.2px solid',
                    borderColor: selectedSize === s.size ? 'var(--text-main)' : s.stock === 0 ? '#F1F5F9' : '#E2E8F0',
                    background: selectedSize === s.size ? 'var(--text-main)' : 'white',
                    color: selectedSize === s.size ? 'white' : s.stock === 0 ? '#CBD5E1' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: s.stock === 0 ? 'not-allowed' : 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  {s.size}
                  {s.stock > 0 && s.stock <= 3 && (
                    <div style={{ position: 'absolute', bottom: '-20px', left: 0, right: 0, fontSize: '10px', color: '#ef4444' }}>Low stock</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
              <button 
                onClick={handleAddToCart} 
                disabled={addingToCart || totalStock === 0} 
                className="btn-primary"
                style={{ padding: '20px', borderRadius: '12px', fontSize: '1rem', width: '100%', background: 'var(--text-main)' }}
              >
                {addingToCart ? 'Adding...' : 'Add to Bag'}
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ flex: 1, height: '100%', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>−</button>
                <span style={{ width: '40px', textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(selectedSizeStock || 1, quantity + 1))}
                  style={{ flex: 1, height: '100%', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >+</button>
              </div>
            </div>

            <button 
              onClick={handleBuyNow} 
              disabled={totalStock === 0} 
              className="btn-outline"
              style={{ padding: '20px', borderRadius: '12px', fontSize: '1rem', width: '100%' }}
            >
              Buy Now
            </button>
          </div>

          {/* Value Props */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', padding: '32px 0', borderTop: '1px solid var(--border-soft)', marginBottom: '40px' }}>
            {[
              { icon: <FaShieldAlt size={20} />, title: 'Genuine', sub: 'Verified' },
              { icon: <FaTruck size={20} />, title: 'Express', sub: 'Next Day' },
              { icon: <FaUndo size={20} />, title: 'Returns', sub: '7-Day' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>{b.icon}</div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{b.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: '32px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Details</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1rem' }}>{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
