import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import BuyerNavbar from '../../components/BuyerNavbar'
import { FaTrash } from 'react-icons/fa'

export default function Wishlist() {
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      // the endpoint might not exist yet, we'll gracefully fallback
      const { data } = await axios.get('/api/user/wishlist', { withCredentials: true })
      setWishlist(data.data)
    } catch (err) {
      console.error(err)
      setWishlist([])
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id) => {
    try {
      await axios.delete(`/api/user/wishlist/${id}`, { withCredentials: true })
      fetchWishlist()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ background: '#f1f3f6', minHeight: '100vh', paddingBottom: '40px' }}>
      <BuyerNavbar />

      <div style={{ maxWidth: '960px', margin: '32px auto', padding: '0 20px', display: 'flex', gap: '32px' }}>
        
        <div style={{ flex: 1, background: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e0e0e0' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#212121', margin: 0 }}>My Wishlist ({wishlist.length})</h2>
          </div>

          <div>
            {wishlist.map(item => (
              <div key={item._id} style={{ display: 'flex', gap: '24px', padding: '24px', borderBottom: '1px solid #e0e0e0', position: 'relative' }}>
                <FaTrash 
                  style={{ position: 'absolute', right: '24px', top: '24px', color: '#c2c2c2', cursor: 'pointer' }} 
                  onClick={() => handleRemove(item._id)}
                />
                
                <div style={{ width: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src={item.images?.[0]} alt={item.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'contain', opacity: item.totalStock === 0 ? 0.6 : 1 }} />
                  {item.totalStock === 0 && (
                    <div style={{ color: '#e91e63', fontSize: '0.8rem', fontWeight: 600, marginTop: '8px', textAlign: 'center' }}>
                      Currently<br/>unavailable
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, paddingRight: '40px' }}>
                  <div style={{ fontSize: '1rem', color: '#212121', marginBottom: '8px', cursor: 'pointer' }} onClick={() => navigate(`/product/${item._id}`)}>
                    {item.name}
                  </div>
                  
                  {/* Assured Badge Simulation */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ background: '#2874f0', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', fontStyle: 'italic', display: 'flex', gap: '2px', alignItems: 'center' }}>
                      ✓ Assured
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 600 }}>₹{item.price.toLocaleString()}</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span style={{ fontSize: '0.9rem', color: '#878787', textDecoration: 'line-through' }}>₹{item.originalPrice.toLocaleString()}</span>
                    )}
                    {item.discount && (
                      <span style={{ fontSize: '0.9rem', color: '#388e3c', fontWeight: 600 }}>{item.discount}</span>
                    )}
                  </div>
                </div>

              </div>
            ))}

            {wishlist.length === 0 && !loading && (
               <div style={{ padding: '40px', textAlign: 'center', color: '#878787' }}>Your wishlist is empty.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
