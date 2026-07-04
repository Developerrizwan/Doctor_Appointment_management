import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import ThemeToggle from '../../components/ThemeToggle'

// Header for the tenant-less public marketing pages.
const PublicNav = () => {
  const navigate = useNavigate()
  return (
    <div className='flex items-center justify-between py-4 border-b border-gray-300'>
      <Link to='/'>
        <img className='w-40 cursor-pointer' src={assets.logo} alt='Forwation' />
      </Link>
      <div className='flex items-center gap-4 text-sm'>
        <a href='#pricing' className='hidden sm:inline text-gray-600 hover:text-black'>
          Pricing
        </a>
        <ThemeToggle />
        <button
          onClick={() => navigate('/signup')}
          className='bg-blue-600 text-white px-5 py-2 rounded-full'
        >
          Get started
        </button>
      </div>
    </div>
  )
}

export default PublicNav
