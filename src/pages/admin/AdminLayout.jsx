import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'
import { useAuth } from '../../context/AuthContext'
import { useConfirm } from '../../context/ConfirmContext'
import { useTenantNavigate, useTenantPath } from '../../context/TenantContext'
import ThemeToggle from '../../components/ThemeToggle'

const linkClass = ({ isActive }) =>
  `px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
    isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-50'
  }`

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useTenantNavigate()
  const tp = useTenantPath()
  const confirm = useConfirm()

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
      {/* Top bar */}
      <div className='flex items-center justify-between px-6 py-3 border-b bg-white'>
        <div className='flex items-center gap-3'>
          <img className='w-36 cursor-pointer' src={assets.logo} onClick={() => navigate('/')} alt='' />
          <span className='text-xs border px-2 py-0.5 rounded-full text-gray-600'>Admin</span>
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
        {/* Sidebar */}
        <aside className='w-56 min-h-[calc(100vh-57px)] border-r bg-white p-3 flex flex-col gap-1'>
          <NavLink end to={tp('/admin')} className={linkClass}>Dashboard</NavLink>
          <NavLink to={tp('/admin/doctors')} className={linkClass}>Doctors</NavLink>
          <NavLink to={tp('/admin/appointments')} className={linkClass}>Appointments</NavLink>
        </aside>

        {/* Content */}
        <main className='flex-1 p-6'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
