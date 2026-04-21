import React, { useState, useEffect } from 'react'
import axios from 'axios'
import BuyerNavbar from '../../components/BuyerNavbar'
import { useAuth } from '../../context/AuthContext'
import { FaUserEdit, FaEnvelope, FaIdBadge, FaCalendarAlt } from 'react-icons/fa'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(user || {})
  const [isEditing, setIsEditing] = useState(false)
  const [newAvatar, setNewAvatar] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('/api/auth/me', { withCredentials: true })
      setProfile(data.user || {})
      setNewAvatar(data.user?.avatar || '')
    } catch (err) { console.error(err) }
  }

  const handleUpdateAvatar = async () => {
    setUpdating(true)
    try {
      const { data } = await axios.put('/api/auth/update-profile', { avatar: newAvatar }, { withCredentials: true })
      setProfile(data.user)
      setIsEditing(false)
      alert('Profile image updated successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update image')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div style={{ background: '#f8f9fc', minHeight: '100vh', paddingBottom: '40px' }}>
      <BuyerNavbar />
      
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          
          <div style={{ background: 'linear-gradient(135deg, #1e293b, #334155)', padding: '60px 40px', color: 'white', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
              <div style={{ 
                width: '100%', height: '100%', 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: '3rem', fontWeight: 800,
                overflow: 'hidden',
                border: '4px solid rgba(255,255,255,0.2)'
              }}>
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  profile.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                style={{ 
                  position: 'absolute', bottom: '0', right: '0', 
                  background: 'var(--primary)', color: 'white', border: 'none', 
                  width: '36px', height: '36px', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }}
              >
                <FaUserEdit size={16} />
              </button>
            </div>

            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>{profile.name || 'Your Profile'}</h1>
            <p style={{ margin: '8px 0 0', opacity: 0.7, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem' }}>Buyer Account</p>
          </div>

          {isEditing && (
            <div style={{ padding: '24px 40px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>PROFILE IMAGE URL</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  value={newAvatar}
                  onChange={(e) => setNewAvatar(e.target.value)}
                  placeholder="Paste image URL here..."
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                />
                <button 
                  onClick={handleUpdateAvatar}
                  disabled={updating}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {updating ? 'Saving...' : 'Save'}
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  style={{ background: 'transparent', color: '#64748b', border: '1.5px solid #cbd5e1', padding: '0 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '50%', color: 'var(--primary)', border: '1px solid #e2e8f0' }}><FaIdBadge size={20} /></div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Full Name</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{profile.name || 'Not provided'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '50%', color: 'var(--primary)', border: '1px solid #e2e8f0' }}><FaEnvelope size={20} /></div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Email Address</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{profile.email || 'Not provided'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '50%', color: 'var(--primary)', border: '1px solid #e2e8f0' }}><FaCalendarAlt size={20} /></div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Member Since</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}
                </div>
              </div>
            </div>

          </div>

          <div style={{ background: '#f8fafc', padding: '24px 40px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => setIsEditing(true)}
              style={{ background: 'var(--text-main)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FaUserEdit /> Edit Profile
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
