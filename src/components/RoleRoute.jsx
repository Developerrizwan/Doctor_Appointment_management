import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTenantPath } from '../context/TenantContext'

// Guards a route subtree by role. Not logged in -> the hospital's login; wrong
// role -> the hospital's home.
const RoleRoute = ({ role, children }) => {
  const { user } = useAuth()
  const tp = useTenantPath()
  if (!user) return <Navigate to={tp('/login')} replace />
  if (user.role !== role) return <Navigate to={tp('/')} replace />
  return children
}

export default RoleRoute
