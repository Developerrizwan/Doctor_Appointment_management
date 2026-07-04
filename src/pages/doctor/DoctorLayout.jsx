import React, { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { parseApiError } from '../../api/errors'
import { assets } from '../../assets/assets'
import { useAuth } from '../../context/AuthContext'
import { useConfirm } from '../../context/ConfirmContext'
import { useTenantNavigate, useTenantPath } from '../../context/TenantContext'
import ThemeToggle from '../../components/ThemeToggle'

const linkClass = ({ isActive }) =>
  `px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
    isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-50'
  }`

const DoctorLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useTenantNavigate()
  const tp = useTenantPath()
  const confirm = useConfirm()

  const [available, setAvailable] = useState(null) // null = unknown/loading
  const [toggling, setToggling] = useState(false)
  const [error, setError] = useState('')

  // There's no GET /doctors/me/ endpoint, so read the current availability by
  // searching the public list for this doctor's own record (small result set).
  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const { data } = await api.get('/doctors/', { params: { search: user?.name } })
        const mine = data.results.find((d) => d.name === user?.name)
        if (!ignore && mine) setAvailable(mine.available)
      } catch {
        /* non-fatal: toggle still works, just starts from unknown */
      }
    }
    if (user) load()
    return () => { ignore = true }
  }, [user])

  const toggle = async () => {
    setToggling(true)
    setError('')
    try {
      const { data } = await api.patch('/doctors/me/availability/', {
        available: !available,
      })
      setAvailable(data.available)
      toast.success(data.available ? 'You are now available' : 'You are now paused')
    } catch (err) {
      setError(parseApiError(err, 'Could not update availability.'))
    } finally {
      setToggling(false)
    }
  }

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Log out',
      message: 'Are you sure you want to log out?',
      confirmText: 'Logout',
      tone: 'danger',
    })
    if (!ok) return
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='flex items-center justify-between px-6 py-3 border-b bg-white'>
        <div className='flex items-center gap-3'>
          <img className='w-36 cursor-pointer' src={assets.logo} onClick={() => navigate('/')} alt='' />
          <span className='text-xs border px-2 py-0.5 rounded-full text-gray-600'>Doctor</span>
        </div>
        <div className='flex items-center gap-4 text-sm'>
          <ThemeToggle />
          <span className='text-gray-600 hidden sm:inline'>{user?.name || user?.email}</span>
          <button onClick={handleLogout} className='bg-blue-600 text-white px-4 py-1.5 rounded-full'>
            Logout
          </button>
        </div>
      </div>

      <div className='flex'>
        <aside className='w-56 min-h-[calc(100vh-57px)] border-r bg-white p-3 flex flex-col gap-1'>
          <NavLink end to={tp('/doctor')} className={linkClass}>Dashboard</NavLink>
          <NavLink to={tp('/doctor/appointments')} className={linkClass}>Appointments</NavLink>

          <div className='mt-4 border-t pt-4 text-sm'>
            <p className='text-gray-500 mb-2'>Availability</p>
            <button
              onClick={toggle}
              disabled={toggling || available === null}
              className={`w-full px-3 py-2 rounded-md text-white disabled:opacity-60 ${
                available ? 'bg-green-600' : 'bg-gray-500'
              }`}
            >
              {available === null
                ? 'Loading…'
                : toggling
                ? 'Updating…'
                : available
                ? 'Available (click to pause)'
                : 'Unavailable (click to enable)'}
            </button>
            {error && <p className='text-red-500 text-xs mt-2'>{error}</p>}
          </div>
        </aside>

        <main className='flex-1 p-6'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DoctorLayout
