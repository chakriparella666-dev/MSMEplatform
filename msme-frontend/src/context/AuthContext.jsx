import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api/authApi'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [retries, setRetries] = useState(0)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMe();
        setUser(data.user);
        setLoading(false);
      } catch (err) {
        // If DB is busy (503) or connection flicker, retry up to 5 times
        if (err.response?.status === 503 && retries < 5) {
          setRetries(prev => prev + 1);
          console.log(`📡 Database busy. Retrying auth...`);
          setTimeout(fetchUser, 2000);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    };
    fetchUser();
  }, [])

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {loading ? (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--background)',
          fontFamily: "'Outfit', sans-serif"
        }}>
          <div style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              border: '4px solid #E2E8F0',
              borderTop: '4px solid var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{
              position: 'absolute',
              inset: '15px',
              border: '4px solid #E2E8F0',
              borderBottom: '4px solid var(--secondary)',
              borderRadius: '50%',
              animation: 'spin 1.5s linear infinite reverse'
            }} />
          </div>
          <h2 style={{ color: 'var(--primary-dark)', fontWeight: 800, marginBottom: '8px' }}>
            MSME Platform
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
            {retries > 0 ? `Connecting to database (Attempt ${retries}/5)...` : 'Initializing secure session...'}
          </p>
        </div>
      ) : children}
    </AuthContext.Provider>
  )
}

const useAuth = () => useContext(AuthContext)
export { AuthProvider, useAuth }
