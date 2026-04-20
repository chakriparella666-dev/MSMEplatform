import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import BuyerNavbar from '../../components/BuyerNavbar'
import { FaPlus, FaEllipsisV, FaCrosshairs, FaMapMarkerAlt } from 'react-icons/fa'
import { fetchStates } from '../../services/locationService'

export default function Addresses() {
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [apiStates, setApiStates] = useState([])

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [pincode, setPincode] = useState('')
  const [locality, setLocality] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [landmark, setLandmark] = useState('')
  const [altPhone, setAltPhone] = useState('')
  const [type, setType] = useState('Home')

  useEffect(() => {
    fetchAddresses()
    fetchStates().then(setApiStates)
  }, [])

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get('/api/auth/me')
      setAddresses(data.data?.savedAddresses || [])
    } catch (err) { console.error(err) }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const newAddr = { name, phone, pincode, locality, street, city, state, landmark, altPhone, type }
      await axios.post('/api/user/addresses', newAddr, { withCredentials: true })
      setShowForm(false)
      fetchAddresses()
    } catch (err) {
      console.error(err)
    }
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by your browser')
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        if (res.data && res.data.address) {
          const addr = res.data.address
          setPincode(addr.postcode || '')
          setCity(addr.city || addr.town || addr.village || addr.county || '')
          setLocality(addr.suburb || addr.neighbourhood || addr.state_district || '')
          setStreet((addr.road || '') + (addr.house_number ? ', ' + addr.house_number : ''))
          
          if (addr.state) {
            setState(addr.state)
          }
        }
      } catch (err) {
        console.error('Geo error', err)
      } finally {
        setGettingLocation(false)
      }
    }, (err) => {
      alert('Unable to retrieve your location. Please grant permission.')
      setGettingLocation(false)
    })
  }

  return (
    <div style={{ background: '#f8f9fc', minHeight: '100vh' }}>
      <BuyerNavbar />
      
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>Manage Addresses</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Add or update your delivery locations</p>
          </div>
          {!showForm && (
            <button 
              className="btn-primary" 
              onClick={() => setShowForm(true)}
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FaPlus /> Add New Address
            </button>
          )}
        </div>

        {showForm && (
          <div className="glass-card" style={{ padding: '40px', marginBottom: '40px', position: 'relative', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                <FaPlus size={16} />
              </div>
              Add a New Address
            </h2>
            
            <button 
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={gettingLocation}
              style={{ width: '100%', background: gettingLocation ? '#f1f5f9' : '#EFF6FF', color: '#2563EB', border: '1.5px solid #3B82F6', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: gettingLocation ? 'default' : 'pointer', fontWeight: 700, marginBottom: '32px', transition: 'all 0.3s' }}
            >
              <FaCrosshairs color="#3B82F6" /> {gettingLocation ? 'Auto-detecting your location...' : 'Use my current location'}
            </button>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {[
                  { label: 'Full Name', val: name, set: setName, ph: 'Enter your name', key: 'name' },
                  { label: 'Phone Number', val: phone, set: setPhone, ph: '10-digit mobile number', key: 'phone' },
                  { label: 'Pincode', val: pincode, set: setPincode, ph: '6-digit PIN', key: 'pincode' },
                  { label: 'Locality', val: locality, set: setLocality, ph: 'e.g. Sector 4, MG Road', key: 'locality' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>{f.label}</label>
                    <input 
                      type="text" 
                      placeholder={f.ph} 
                      required 
                      value={f.val} 
                      onChange={e => {
                        let val = e.target.value
                        if (f.key === 'phone') val = val.replace(/\D/g, '').slice(0, 10)
                        if (f.key === 'pincode') val = val.replace(/\D/g, '').slice(0, 6)
                        f.set(val)
                      }} 
                      style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', background: '#fcfdfe' }} 
                    />
                  </div>
                ))}
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Street / Area / House No.</label>
                <textarea 
                  placeholder="House no., street, locality" required 
                  value={street} onChange={e => setStreet(e.target.value)}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', minHeight: '100px', resize: 'vertical', background: '#fcfdfe' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>City / District</label>
                  <input type="text" placeholder="City" required value={city} onChange={e => setCity(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', background: '#fcfdfe' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>State</label>
                  <select value={state} onChange={e => setState(e.target.value)} required style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', backgroundColor: '#fcfdfe' }}>
                    <option value="">-- Choose State --</option>
                    {apiStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Landmark (Optional)</label>
                  <input type="text" placeholder="e.g. Near Apollo Hospital" value={landmark} onChange={e => setLandmark(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', background: '#fcfdfe' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Alternate Phone (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Second contact number" 
                    value={altPhone} 
                    onChange={e => setAltPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                    style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', background: '#fcfdfe' }} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '16px', textTransform: 'uppercase' }}>Address Type</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {['Home', 'Work'].map(t => (
                    <button 
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      style={{ padding: '12px 32px', borderRadius: '12px', border: type === t ? '2px solid var(--primary)' : '1px solid #e2e8f0', background: type === t ? '#eff6ff' : 'white', color: type === t ? 'var(--primary)' : '#64748b', fontWeight: 800, cursor: 'pointer', flex: 1, transition: 'all 0.2s' }}
                    >
                      {t === 'Home' ? '🏠 Home' : '🏢 Work'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 2, padding: '16px', fontWeight: 800, fontSize: '1rem' }}>SAVE ADDRESS</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline" style={{ flex: 1, padding: '16px', fontWeight: 800 }}>CANCEL</button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '24px' }}>
          {(addresses || []).length === 0 && !showForm && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
              <FaMapMarkerAlt size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No addresses saved yet.</p>
            </div>
          )}
          {(addresses || []).map((addr, idx) => (
            <div key={addr.id || idx} className="glass-card" style={{ padding: '28px', border: '1px solid #e2e8f0', position: 'relative', background: 'white', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ position: 'absolute', right: '20px', top: '20px', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}>
                <FaEllipsisV />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '0.7rem', fontWeight: 900, padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>{addr.type || 'HOME'}</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>{addr.name}</span>
              </div>
              
              <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{addr.phone}</div>
                <div>{addr.street}</div>
                <div>{addr.locality}, {addr.city}</div>
                <div>{addr.state} - <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{addr.pincode}</span></div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>EDIT</button>
                <button style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>REMOVE</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
