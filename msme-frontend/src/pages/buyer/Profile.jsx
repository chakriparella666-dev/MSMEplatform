import React, { useState, useEffect } from 'react'
import axios from 'axios'
import BuyerNavbar from '../../components/BuyerNavbar'
import { useAuth } from '../../context/AuthContext'
import { FaUserEdit, FaEnvelope, FaIdBadge, FaCalendarAlt } from 'react-icons/fa'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(user || {})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('/api/auth/me', { withCredentials: true })
      setProfile(data.user || {})
    } catch (err) { console.error(err) }
  }

  return (
    <div style={{ background: '#f8f9fc', minHeight: '100vh', paddingBottom: '40px' }}>
      <BuyerNavbar />
      
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          
          <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', padding: '40px', color: 'white', textAlign: 'center', position: 'relative' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem', fontWeight: 800 }}>
              {profile.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>{profile.name || 'Your Profile'}</h1>
            <p style={{ margin: '8px 0 0', opacity: 0.9 }}>Buyer Account</p>
          </div>

          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid #eee' }}>
              <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}><FaIdBadge size={20} /></div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Full Name</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>{profile.name || 'Not provided'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid #eee' }}>
              <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}><FaEnvelope size={20} /></div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Email Address</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>{profile.email || 'Not provided'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}><FaCalendarAlt size={20} /></div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Member Since</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}
                </div>
              </div>
            </div>

          </div>

          <div style={{ background: '#f8fafc', padding: '24px 40px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaUserEdit /> Edit Profile
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
