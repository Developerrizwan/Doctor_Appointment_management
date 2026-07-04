import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import ThemeToggle from '../../components/ThemeToggle'
import { platformStore } from '../../api/platform'

const PlatformNav = ({ showLogout = true }) => {
  const navigate = useNavigate()
  const user = platformStore.user()

  const logout = () => {
    platformStore.clear()
    navigate('/platform/login')
  }

  return (
    <div className='flex items-center justify-between px-6 py-3 border-b bg-white'>
      <div className='flex items-center gap-3'>
        <img className='w-36' src={assets.logo} alt='Forwation' />
        <span className='text-xs border px-2 py-0.5 rounded-full text-gray-600'>
          Platform Console
        </span>
      </div>
      <div className='flex items-center gap-4 text-sm'>
        <ThemeToggle />
        {showLogout && (
          <>
            <span className='text-gray-600 hidden sm:inline'>{user?.name || user?.email}</span>
            <button onClick={logout} className='bg-blue-600 text-white px-4 py-1.5 rounded-full'>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default PlatformNav
