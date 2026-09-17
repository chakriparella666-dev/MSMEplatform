import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background, #F9FAFB)',
        fontFamily: "'Sora', sans-serif"
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(61,90,254,0.15)',
          borderTop: '3px solid #3D5AFE',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
          Verifying session...
        </span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role || 'buyer'
    if (!allowedRoles.includes(userRole)) {
      // If user doesn't have access to this role page, redirect to their home
      if (userRole === 'seller') return <Navigate to="/seller" replace />
      if (userRole === 'admin') return <Navigate to="/admin" replace />
      return <Navigate to="/buyer" replace />
    }
  }

  return children
}
