import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaSearch, FaShoppingCart, FaUserCircle, FaBars, FaChevronRight, FaMapMarkerAlt, FaTimes, FaExchangeAlt, FaShoppingBag, FaCrosshairs, FaHeart, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

import { fetchStates, fetchDistricts } from '../services/locationService'

export default function BuyerNavbar({ onSearchChange, onCategoryChange, currentSearch, currentCategory }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const [localSearch, setLocalSearch] = useState(currentSearch || '')
  const [cart, setCart] = useState({ items: [] })
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [district, setDistrict] = useState(() => {
    return localStorage.getItem('user_district') || user?.address?.city || ''
  })

  useEffect(() => {
    if (district) {
      localStorage.setItem('user_district', district);
    }
  }, [district])

  const [showLocationModal, setShowLocationModal] = useState(false)
  const [selectedStateForLoc, setSelectedStateForLoc] = useState('')
  const [gettingLocation, setGettingLocation] = useState(false)
  const [apiStates, setApiStates] = useState([])
  const [apiDistricts, setApiDistricts] = useState([])

  useEffect(() => {
    fetchStates().then(setApiStates)
  }, [])

  useEffect(() => {
    if (selectedStateForLoc) fetchDistricts(selectedStateForLoc).then(setApiDistricts)
    else setApiDistricts([])
  }, [selectedStateForLoc])

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by your browser')
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        if (res.data && res.data.address) {
          const addr = res.data.address
          const resolvedCity = addr.city || addr.town || addr.village || addr.county || addr.suburb || ''
          
          if (addr.state) {
            setSelectedStateForLoc(addr.state)
            if (resolvedCity) {
              setDistrict(resolvedCity)
              setShowLocationModal(false)
            }
          } else {
            if (resolvedCity) {
              setDistrict(resolvedCity)
              setShowLocationModal(false)
            }
          }
        }
      } catch (err) {
        console.error('Geo error', err)
      } finally {
        setGettingLocation(false)
      }
    }, (err) => {
      alert('Unable to retrieve your location. Check browser permissions.')
      setGettingLocation(false)
    })
  }

  useEffect(() => {
    fetchCategories()
    fetchCart()
    const handleCartUpdate = () => fetchCart()
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])
  
  useEffect(() => {
    if (currentSearch !== undefined) setLocalSearch(currentSearch)
  }, [currentSearch])

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/api/products/categories')
      setCategories(data.data)
    } catch (err) { console.error(err) }
  }

  const fetchCart = async () => {
    try {
      const { data } = await axios.get('/api/cart', { withCredentials: true })
      setCart(data.data)
    } catch (err) { console.error(err) }
  }
  
  const handleSearchCommit = () => {
    if (onSearchChange) {
      onSearchChange(localSearch)
    } else {
      navigate('/buyer') // Ideally would pass search query
    }
  }

  const handleCategorySelect = (cat) => {
    if (onCategoryChange) {
      onCategoryChange(cat)
      if (onSearchChange) { onSearchChange(''); setLocalSearch(''); }
    } else {
      navigate('/buyer')
    }
    setSidebarOpen(false)
  }

  const handleHomeClick = () => {
    if (onCategoryChange) onCategoryChange('All')
    if (onSearchChange) onSearchChange('')
    setLocalSearch('')
    navigate('/buyer')
  }

  const activeCategory = currentCategory || 'All'

  return (
    <>
      <nav className="buyer-nav" style={{ 
        background: 'white', 
        borderBottom: '1px solid var(--border-soft)', 
        height: '80px', 
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} 
          onClick={handleHomeClick}
        >
          <div style={{ background: 'var(--text-main)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaShoppingBag size={18} color="white" />
          </div>
          <span style={{ 
            fontSize: '1.4rem', 
            fontWeight: 800, 
            color: 'var(--text-main)', 
            letterSpacing: '-0.8px', 
            fontFamily: "'Sora', sans-serif" 
          }}>
            MSME<span style={{ color: 'var(--primary)', fontWeight: 400 }}>Market</span>
          </span>
        </div>

        <div className="nav-search-container" style={{ 
          maxWidth: '500px', 
          flex: 1, 
          margin: '0 40px',
          background: '#F8FAFC',
          borderRadius: '12px',
          border: '1.5px solid var(--border-soft)',
          transition: 'var(--transition)'
        }}>
          <input 
            type="text" 
            className="nav-search-input" 
            placeholder="What are you looking for?"
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value)
              if (onSearchChange) onSearchChange(e.target.value)
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchCommit()}
            style={{ 
              background: 'transparent', 
              padding: '12px 20px', 
              fontSize: '0.95rem',
              color: 'var(--text-main)' 
            }}
          />
          <button 
            className="nav-search-btn" 
            onClick={handleSearchCommit} 
            style={{ background: 'transparent', color: 'var(--text-muted)' }}
          >
            <FaSearch size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div 
            style={{ cursor: 'pointer', textAlign: 'center' }}
            onClick={() => setShowLocationModal(true)}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery to</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.9rem' }}>
              <FaMapMarkerAlt size={12} color="var(--primary)" /> {district || 'Set Location'}
            </div>
          </div>

          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
            onClick={() => setSidebarOpen(true)}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Welcome</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{user?.name ? user.name.split(' ')[0] : 'Account'}</div>
            </div>
            <FaUserCircle size={28} color="#CBD5E1" />
          </div>

          <div 
            onClick={() => navigate('/cart')} 
            style={{ 
              position: 'relative', 
              cursor: 'pointer',
              background: 'var(--text-main)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '99px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'var(--transition)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <FaShoppingCart size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Bag</span>
            <span style={{ 
              background: 'var(--primary)', 
              color: 'white', 
              borderRadius: '50%', 
              minWidth: '20px', 
              height: '20px', 
              fontSize: '11px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(61, 90, 254, 0.4)'
            }}>
              {cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}
            </span>
          </div>
        </div>
      </nav>

      {/* Subnav */}
      <div className="buyer-subnav" style={{ alignItems: 'center', gap: '20px' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', borderRight: '1px solid #eee', paddingRight: '15px', color: 'var(--primary)', fontWeight: 800 }} 
          onClick={() => setSidebarOpen(true)}
        >
          <FaBars /> All
        </div>
        
        <div 
          className={`subnav-link ${activeCategory === 'All' ? 'active' : ''}`} 
          onClick={() => handleCategorySelect('All')}
          style={{ 
            color: activeCategory === 'All' ? 'var(--primary)' : 'inherit', 
            borderBottom: activeCategory === 'All' ? '2px solid var(--primary)' : 'none',
            whiteSpace: 'nowrap'
          }}
        >
          All Products
        </div>

        <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <div 
              key={cat} 
              className={`subnav-link ${activeCategory === cat ? 'active' : ''}`} 
              onClick={() => handleCategorySelect(cat)}
              style={{ 
                color: activeCategory === cat ? 'var(--primary)' : 'inherit', 
                borderBottom: activeCategory === cat ? '2px solid var(--primary)' : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setSidebarOpen(false)}
        style={{ 
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', 
          backdropFilter: 'blur(4px)', zIndex: 1999, 
          visibility: isSidebarOpen ? 'visible' : 'hidden',
          opacity: isSidebarOpen ? 1 : 0,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      ></div>

      {/* Premium Sidebar Drawer */}
      <div 
        className={`buyer-sidebar ${isSidebarOpen ? 'open' : ''}`}
        style={{ 
          position: 'fixed', top: 0, left: 0, right: 'auto', bottom: 0, width: '340px', 
          background: 'white', zIndex: 2000, 
          boxShadow: '20px 0 60px rgba(0,0,0,0.1)',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-out',
          display: 'flex', flexDirection: 'column',
          willChange: 'transform'
        }}
      >
        <div style={{ background: 'var(--text-main)', padding: '24px 32px 20px', color: 'white', position: 'relative' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); setSidebarOpen(false); }} 
            style={{ 
              position: 'absolute', top: '16px', right: '16px', 
              background: 'rgba(255,255,255,0.08)', border: 'none', 
              color: 'white', cursor: 'pointer', width: '28px', height: '28px',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease' 
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <FaTimes size={14} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <FaUserCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '2px' }}>Account</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>{user?.name || 'Guest User'}</div>
        </div>

        <div style={{ padding: '20px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { label: 'Orders', icon: <FaShoppingBag />, path: '/my-orders' },
              { label: 'My Bag', icon: <FaShoppingCart />, path: '/cart' },
              { label: 'Wishlist', icon: <FaHeart />, path: '/wishlist' },
              { label: 'Addresses', icon: <FaMapMarkerAlt />, path: '/addresses' },
              { label: 'Settings', icon: <FaUserCircle />, path: '/profile' },
            ].map(item => (
              <div 
                key={item.label} 
                onClick={() => { setSidebarOpen(false); navigate(item.path) }}
                style={{ 
                  padding: '12px 0', borderBottom: '1px solid var(--border-soft)', cursor: 'pointer', 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{item.icon}</span>
                  {item.label}
                </span>
                <FaChevronRight size={8} color="#CBD5E1" />
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '16px', borderRadius: '8px', background: '#F8FAFC', border: '1px dashed var(--border)' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaExchangeAlt size={10} color="var(--primary)" /> Merchant Mode
            </h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Switch to manage inventory.</p>
            <button 
              onClick={() => { setSidebarOpen(false); navigate('/seller'); }} 
              style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', width: '100%' }}
            >
              Go to Seller Hub
            </button>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <button 
              onClick={() => { logout(); setSidebarOpen(false); }}
              style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}
            >
              <FaSignOutAlt size={14} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowLocationModal(false)}>
          <div style={{ background: 'white', borderRadius: '16px', width: '90%', maxWidth: '500px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Select Delivery Location</h2>
              <FaTimes style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowLocationModal(false)} />
            </div>

            <button 
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={gettingLocation}
              style={{ width: '100%', background: gettingLocation ? '#f1f5f9' : '#EFF6FF', color: gettingLocation ? '#94a3b8' : '#2563EB', border: `1.5px solid ${gettingLocation ? '#e2e8f0' : '#3B82F6'}`, padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: gettingLocation ? 'default' : 'pointer', fontWeight: 700, marginBottom: '24px', transition: 'all 0.3s ease' }}
            >
              <FaCrosshairs color={gettingLocation ? '#94a3b8' : '#3B82F6'} /> {gettingLocation ? 'Locating via GPS...' : 'Auto-detect my location'}
            </button>

            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '24px', textTransform: 'uppercase' }}>-- OR SELECT MANUALLY --</div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>1. Select State</label>
              <select 
                value={selectedStateForLoc} 
                onChange={(e) => { setSelectedStateForLoc(e.target.value) }}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none' }}
              >
                <option value="">-- Choose State --</option>
                {apiStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {selectedStateForLoc && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>2. Select District</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                  {apiDistricts.map(dist => (
                    <button 
                      key={dist}
                      onClick={() => { setDistrict(dist); setShowLocationModal(false); }}
                      style={{ padding: '12px', background: district === dist ? 'var(--primary)' : '#f8fafc', color: district === dist ? 'white' : 'var(--text-main)', border: district === dist ? 'none' : '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', textAlign: 'left' }}
                    >
                      {dist}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
