import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { getMe } from '../api/authApi'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try {
      const cached = localStorage.getItem('user');
      if (cached) return JSON.parse(cached);
      
      // Optimistic check: if we have a name cookie, create a temporary user object
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
      }
      const name = getCookie('display_name');
      if (name) {
        return { 
          name, 
          businessName: getCookie('business_name'),
          isProfileComplete: getCookie('is_complete') === 'true',
          isOptimistic: true 
        };
      }
      
      return null;
    } catch { return null; }
  })
  const [loading, setLoading] = useState(!user)
  const [retries, setRetries] = useState(0)
  const isMounted             = useRef(true)
  const retryTimeoutRef       = useRef(null)

  const fetchUser = async () => {
    try {
      const data = await getMe();
      if (!isMounted.current) return;
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setLoading(false);
    } catch (err) {
      if (!isMounted.current) return;
      if (err.response?.status === 503 && retries < 5) {
        setRetries(prev => prev + 1);
        console.log(`📡 Database busy. Retrying auth...`);
        retryTimeoutRef.current = setTimeout(fetchUser, 2000);
      } else {
        setUser(null);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUser();
    return () => {
      isMounted.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [])

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('onboarding_skipped');
    setUser(null);
    window.location.href = '/login';
  };

  const isPublicRoute = ['/login', '/register', '/forgot-password', '/reset-password', '/'].some(path => 
    path === '/' ? window.location.pathname === '/' : window.location.pathname.startsWith(path)
  );

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => useContext(AuthContext)
export { AuthProvider, useAuth }
