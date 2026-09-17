import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { getMe } from '../api/authApi'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [retries, setRetries] = useState(0)
  const isMounted             = useRef(true)
  const retryTimeoutRef       = useRef(null)

  const updateSetUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('display_name');
    }
  };

  const fetchUser = async () => {
    // Safety timeout to ensure loading never hangs indefinitely
    const safetyTimer = setTimeout(() => {
      if (isMounted.current) {
        setLoading(false);
      }
    }, 4000);

    try {
      const data = await getMe();
      clearTimeout(safetyTimer);
      if (!isMounted.current) return;

      if (data && data.user) {
        updateSetUser(data.user);
      } else {
        updateSetUser(null);
      }
    } catch (err) {
      clearTimeout(safetyTimer);
      if (!isMounted.current) return;

      const status = err.response?.status;
      if (status === 503 && retries < 3) {
        setRetries(prev => prev + 1);
        retryTimeoutRef.current = setTimeout(fetchUser, 1500);
        return;
      } else {
        updateSetUser(null);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchUser();
    return () => {
      isMounted.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const logout = async () => {
    try {
      const { logoutUser } = await import('../api/authApi');
      await logoutUser();
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('onboarding_skipped');
      localStorage.removeItem('display_name');
      
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "display_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateSetUser, loading, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => useContext(AuthContext)
export { AuthProvider, useAuth }
