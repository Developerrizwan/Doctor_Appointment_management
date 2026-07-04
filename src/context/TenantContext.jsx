import React, { createContext, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { setTenantSlug } from '../api/axios'

const TenantContext = createContext()

export const useTenant = () => useContext(TenantContext)

// Wraps the tenant subtree: reads the slug from the route and keeps the axios
// layer (localStorage fallback) in sync so token refresh works off-route too.
export const TenantProvider = ({ children }) => {
  const { hospitalSlug } = useParams()
  if (hospitalSlug) setTenantSlug(hospitalSlug)
  return (
    <TenantContext.Provider value={{ slug: hospitalSlug }}>
      {children}
    </TenantContext.Provider>
  )
}

// Build a slug-prefixed path, e.g. tp('/doctors') -> '/demo-hospital/doctors'.
export const useTenantPath = () => {
  const { slug } = useTenant()
  return (path = '') => {
    const p = path.startsWith('/') ? path : `/${path}`
    return `/${slug}${p === '/' ? '' : p}`
  }
}

// Slug-aware navigate. Numbers pass through (e.g. navigate(0) to reload).
export const useTenantNavigate = () => {
  const navigate = useNavigate()
  const tp = useTenantPath()
  return (path, opts) =>
    typeof path === 'number' ? navigate(path) : navigate(tp(path), opts)
}
