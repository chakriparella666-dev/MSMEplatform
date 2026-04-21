import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import {
  FaSearch, FaShoppingCart, FaUserCircle, FaBars, FaChevronLeft, FaChevronRight,
  FaMapMarkerAlt, FaStar, FaShoppingBag, FaTimes, FaExchangeAlt, FaHeart, FaRegHeart
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import BuyerNavbar from '../../components/BuyerNavbar'

const ProductCard = ({ p, handleAddToCart, wishlistIds = [], toggleWishlist }) => {
  const [currentImg, setCurrentImg] = useState(0)
  const navigate = useNavigate()

  const nextImg = (e) => {
    e.stopPropagation()
    setCurrentImg((prev) => (prev + 1) % p.images.length)
  }

  const prevImg = (e) => {
    e.stopPropagation()
    setCurrentImg((prev) => (prev - 1 + p.images.length) % p.images.length)
  }

  return (
    <div
      className="glass-card"
      onClick={() => navigate(`/product/${p._id}`)}
      style={{ 
        padding: '0', 
        background: 'white', 
        overflow: 'hidden', 
        border: 'none', 
        display: 'flex', 
        flexDirection: 'column', 
        cursor: 'pointer', 
        position: 'relative',
        borderRadius: 'var(--radius)'
      }}
    >
      <div
        onClick={(e) => { e.stopPropagation(); toggleWishlist(p._id) }}
        style={{ 
          position: 'absolute', 
          top: '16px', 
          right: '16px', 
          zIndex: 10, 
          background: 'rgba(255,255,255,0.9)', 
          borderRadius: '50%', 
          padding: '10px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'var(--transition)'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {wishlistIds.includes(p._id) ? <FaHeart color="#ef4444" size={18} /> : <FaRegHeart color="#0f172a" size={18} />}
      </div>
      
      <div style={{ height: '300px', background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
        <img
          src={p.images[currentImg] || 'https://via.placeholder.com/400?text=No+Image'}
          style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
          alt={p.name}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Image+Load+Error' }}
        />

        {p.images.length > 1 && (
          <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '6px 10px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
            {p.images.map((_, i) => (
              <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === currentImg ? 'white' : 'rgba(255,255,255,0.5)', transition: 'var(--transition)' }}></div>
            ))}
          </div>
        )}

        {p.totalStock === 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <span style={{ background: '#0f172a', color: 'white', padding: '10px 24px', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>OUT OF STOCK</span>
          </div>
        )}
      </div>

      <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{p.category}</div>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', minHeight: '48px', lineHeight: 1.4, color: 'var(--text-main)' }}>{p.name}</h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>₹{p.price.toLocaleString()}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FaStar color="#FFB800" size={12} />
            <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-main)' }}>{p.rating || '4.8'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <FaMapMarkerAlt size={12} color="var(--secondary)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{p.district || 'All India'}</span>
          {p.isLocal && (
            <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 900 }}>LOCAL</span>
          )}
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button
            className="btn-primary"
            style={{ width: '100%', borderRadius: '8px' }}
            onClick={(e) => { 
              e.stopPropagation(); 
              if (p.totalStock === 0) {
                alert(`Notify Me: Success!\n\nWe will email you at ${user?.email || 'your email'} once "${p.name}" is back in stock.`);
              } else {
                navigate(`/product/${p._id}`);
              }
            }}
          >
            {p.totalStock === 0 ? 'Notify Me' : 'Buy Now'}
          </button>
        </div>

      </div>
    </div>
  )
}

const ProductSkeleton = () => (
  <div className="glass-card" style={{ padding: '0', background: 'white', overflow: 'hidden', border: 'none' }}>
    <div className="skeleton" style={{ height: '340px', width: '100%', borderRadius: 0 }}></div>
    <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="skeleton" style={{ height: '12px', width: '30%' }}></div>
      <div className="skeleton" style={{ height: '24px', width: '80%' }}></div>
      <div className="skeleton" style={{ height: '18px', width: '40%' }}></div>
      <div style={{ marginTop: '20px' }}>
        <div className="skeleton" style={{ height: '44px', width: '100%', borderRadius: '8px' }}></div>
      </div>
    </div>
  </div>
)

export default function BuyerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  // Initialize from cache for "instant" feel
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_buyer_products')
      return cached ? JSON.parse(cached) : []
    } catch { return [] }
  })
  
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(products.length === 0)
  const [category, setCategory] = useState('All')
  const [wishlistIds, setWishlistIds] = useState([])

  useEffect(() => {
    fetchProducts()
    fetchWishlist()
  }, [search, category])

  const requestCounter = useRef(0)

  const fetchProducts = async () => {
    const requestId = ++requestCounter.current
    if (products.length === 0) setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category && category !== 'All') params.append('category', category)
      
      const { data } = await axios.get(`/api/products?${params.toString()}`)

      
      if (requestId === requestCounter.current) {
        const fetchedProducts = data.data || []
        setProducts(fetchedProducts)
        setLoading(false)
        
        if (!search && category === 'All' && fetchedProducts.length > 0) {
          localStorage.setItem('cached_buyer_products', JSON.stringify(fetchedProducts))
        }
      }
    } catch (err) { 
      console.error("[Dashboard] Fetch Error:", err)
      if (requestId === requestCounter.current) {
        setLoading(false)
      }
    }
  }

  const handleAddToCart = async (productId, size) => {
    try {
      await axios.post('/api/cart/add', { productId, quantity: 1, size }, { withCredentials: true })
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (err) { alert('Sign in to start shopping') }
  }

  const fetchWishlist = async () => {
    try {
      if (!user) return
      const { data } = await axios.get('/api/user/wishlist', { withCredentials: true })
      setWishlistIds(data.data.map(i => i._id))
    } catch (err) { console.error(err) }
  }

  const toggleWishlist = async (productId) => {
    try {
      if (!user) return alert('Please sign in to add to wishlist')
      await axios.post('/api/user/wishlist/toggle', { productId }, { withCredentials: true })
      setWishlistIds(prev =>
        prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <BuyerNavbar
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        currentSearch={search}
        currentCategory={category}
      />

      {/* Main Content Area */}
      <main style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {category === 'All' ? (search ? `Results for "${search}"` : 'Our Best Collection') : `Latest in ${category}`}
            </h2>
            {(!loading || products.length > 0) && (
              <p style={{ color: 'var(--text-muted)' }}>Found {products.length} products curated for you.</p>
            )}
          </div>

        </div>


        {loading && products.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '20px', border: '2px dashed var(--border)' }}>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>No matches found in {category}.</p>
            <button className="btn-outline" style={{ marginTop: '20px' }} onClick={() => { setCategory('All'); setSearch(''); }}>Back to Home</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
            {products.map(p => (
              <ProductCard 
                key={p._id} 
                p={p}
                handleAddToCart={handleAddToCart} 
                wishlistIds={wishlistIds} 
                toggleWishlist={toggleWishlist} 
              />
            ))}

          </div>
        )}
      </main>

    </div>
  )
}
