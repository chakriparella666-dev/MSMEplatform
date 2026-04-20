import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaArrowLeft, FaCheck, FaMapMarkerAlt, FaCrosshairs } from 'react-icons/fa'
import { fetchStates } from '../../services/locationService'

const steps = ['Address', 'Order Summary', 'Payment']

export default function Checkout() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [address, setAddress] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' })
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [gettingLocation, setGettingLocation] = useState(false)
  const [apiStates, setApiStates] = useState([])

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by your browser')
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        if (res.data && res.data.address) {
          const addr = res.data.address
          setAddress(prev => ({
            ...prev,
            pincode: addr.postcode || '',
            city: addr.city || addr.town || addr.village || addr.county || '',
            state: addr.state || '',
            street: (addr.road || '') + (addr.house_number ? ', ' + addr.house_number : '') + (addr.suburb ? ', ' + addr.suburb : '')
          }))
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

  useEffect(() => { 
    fetchCart() 
    fetchStates().then(setApiStates)
  }, [])

  const fetchCart = async () => {
    try {
      const { data } = await axios.get('/api/cart', { withCredentials: true })
      setCart(data.data)
    } catch (err) { navigate('/login') }
    finally { setLoading(false) }
  }

  const subtotal = cart?.items?.reduce((acc, i) => acc + (i.product?.price || 0) * i.quantity, 0) || 0

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city || !address.pincode || !address.phone)
      return alert('Please fill all address fields')
    setPlacing(true)
    try {
      const { data } = await axios.post('/api/orders/checkout', {
        shippingAddress: address,
        paymentMethod
      }, { withCredentials: true })
      navigate('/order-success', { state: { order: data.data } })
    } catch (err) {
      alert(err.response?.data?.message || 'Order placement failed')
    } finally { setPlacing(false) }
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div style={{ width:'40px',height:'40px',border:'4px solid #ddd',borderTopColor:'var(--primary)',borderRadius:'50%',animation:'spin 1s linear infinite' }}></div></div>

  return (
    <div style={{ background: 'white', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
      {/* Sleek Header */}
      <header style={{ height: '80px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', padding: '0 40px' }}>
        <button onClick={() => navigate('/cart')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>
          <FaArrowLeft size={14} /> Back to Cart
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Sora', sans-serif", letterSpacing: '-0.5px' }}>
          Secure Checkout
        </div>
        <div style={{ width: '100px' }}></div> {/* Spacer */}
      </header>

      {/* Modern Progress Line */}
      <div style={{ maxWidth: '600px', margin: '40px auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: '#F1F5F9', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', top: '50%', left: 0, width: `${(step / (steps.length - 1)) * 100}%`, height: '2px', background: 'var(--text-main)', zIndex: 2, transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
        
        {steps.map((s, i) => (
          <div key={i} style={{ zIndex: 10, position: 'relative', textAlign: 'center' }}>
            <div style={{ 
              width: '12px', height: '12px', borderRadius: '50%', 
              background: i <= step ? 'var(--text-main)' : 'white', 
              border: `2px solid ${i <= step ? 'var(--text-main)' : '#CBD5E1'}`,
              margin: '0 auto 12px',
              transition: 'var(--transition)'
            }}></div>
            <span style={{ fontSize: '0.75rem', fontWeight: i <= step ? 700 : 500, textTransform: 'uppercase', letterSpacing: '1px', color: i <= step ? 'var(--text-main)' : 'var(--text-muted)' }}>{s}</span>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '80px' }}>
        {/* Left Side: Form Blocks */}
        <div className="animate-fade-in">
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>Delivery Details</h2>
                <button 
                  onClick={handleGetCurrentLocation}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  <FaCrosshairs size={14} /> {gettingLocation ? 'Locating...' : 'Use current location'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="input-label" style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Full Name</label>
                  <input className="input-field" placeholder="Enter your name" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} />
                </div>
                <div>
                  <label className="input-label" style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Phone</label>
                  <input className="input-field" placeholder="10-digit number" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value.replace(/\D/g, '').slice(0,10)})} />
                </div>
                <div>
                  <label className="input-label" style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>PIN Code</label>
                  <input className="input-field" placeholder="6-digit PIN" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value.replace(/\D/g, '').slice(0,6)})} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="input-label" style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Street Address</label>
                  <input className="input-field" placeholder="House no, Building, Street" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                </div>
                <div>
                  <label className="input-label" style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>City</label>
                  <input className="input-field" placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                </div>
                <div>
                  <label className="input-label" style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>State</label>
                  <select className="input-field" style={{ appearance: 'none' }} value={address.state} onChange={e => setAddress({...address, state: e.target.value})}>
                    <option value="">Choose State</option>
                    {apiStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <button className="btn-primary" style={{ padding: '20px', borderRadius: '12px' }} onClick={() => setStep(1)}>
                Continue to Summary
              </button>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>Review Order</h2>
              
              <div style={{ background: '#F8FAFC', padding: '32px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Shipping To</span>
                  <button onClick={() => setStep(0)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{address.name}</div>
                <div style={{ color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.6 }}>
                  {address.street}, {address.city}, {address.state} - {address.pincode}<br/>
                  {address.phone}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Bag Content</span>
                {cart?.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <img src={item.product?.images?.[0]} style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '12px', background: '#f8fafc' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.product?.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Size: {item.size} • Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 800 }}>₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <button className="btn-primary" style={{ padding: '20px', borderRadius: '12px' }} onClick={() => setStep(2)}>
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>Payment</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { id: 'COD', label: 'Cash on Delivery', desc: 'Pay securely at your doorstep' },
                  { id: 'UPI', label: 'UPI Payment', desc: 'Scan & Pay with any UPI app' },
                  { id: 'CARD', label: 'Credit / Debit Card', desc: 'Secure encryption enabled' },
                ].map(m => (
                  <div 
                    key={m.id} 
                    onClick={() => setPaymentMethod(m.id)}
                    style={{ 
                      padding: '24px', borderRadius: '16px', border: '1.5px solid', 
                      borderColor: paymentMethod === m.id ? 'var(--text-main)' : 'var(--border-soft)',
                      background: paymentMethod === m.id ? 'rgba(15, 23, 42, 0.02)' : 'white',
                      cursor: 'pointer', display: 'flex', gap: '20px', alignItems: 'center', transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid', borderColor: paymentMethod === m.id ? 'var(--text-main)' : '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {paymentMethod === m.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--text-main)' }}></div>}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{m.label}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>{m.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                className="btn-primary" 
                style={{ padding: '20px', borderRadius: '12px', background: 'var(--text-main)' }} 
                onClick={handlePlaceOrder}
                disabled={placing}
              >
                {placing ? 'Processing...' : `Pay ₹${subtotal.toLocaleString()}`}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Summary Card */}
        <div>
          <div style={{ border: '1.5px solid var(--border-soft)', padding: '40px', borderRadius: '24px', position: 'sticky', top: '40px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '32px' }}>Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Shipping</span>
                <span style={{ color: '#059669', fontWeight: 600 }}>Complimentary</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid var(--border-soft)', paddingTop: '24px', marginBottom: '32px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: '1.3rem' }}>₹{subtotal.toLocaleString()}</span>
            </div>
            
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }}></div>
              Secure encrypted checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
