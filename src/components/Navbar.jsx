import React from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../context/ConfirmContext'
import { useTenantNavigate, useTenantPath } from '../context/TenantContext'
import ThemeToggle from './ThemeToggle'

const Navbar = () => {
    const navigate = useTenantNavigate();
    const tp = useTenantPath();
    const { user, logout } = useAuth();
    const confirm = useConfirm();

    const [showMenu, setShowMenu] = useState(false)

    const handleLogout = async () => {
        const ok = await confirm({
            title: 'Log out',
            message: 'Are you sure you want to log out?',
            confirmText: 'Logout',
            tone: 'danger',
        });
        if (!ok) return;
        await logout();
        toast.success('Logged out successfully');
        navigate('/');
    }

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-gray-400'>
        <img onClick={()=>navigate('/')} className='w-44 cursor-pointer' src={assets.logo} alt='' />

        <ul className='hidden md:flex items-start gap-5 font-medium'>
            <NavLink end to={tp('/')}>
                <li className='py-1'>HOME</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>
            <NavLink to={tp('/doctors')}>
                <li className='py-1'>ALL DOCTORS</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>
            <NavLink to={tp('/about')}>
                <li className='py-1'>ABOUT</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>
            <NavLink to={tp('/contact')}>
                <li className='py-1'>CONTACT</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>
        </ul>
        <div className='flex items-center gap-4'>
            <ThemeToggle />
            {
                user
                ?
                <div className='flex items-center gap-3 cursor-pointer group relative'>
                    <img className='w-8 h-8 rounded-full object-cover' src={user.image || assets.profile_pic} alt='' />
                    <img className='w-2.5' src={assets.dropdown_icon} alt='' />
                    <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
                        <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-3 p-4'>
                            <p className='text-gray-800 font-semibold cursor-default'>{user.name || user.email}</p>
                            <hr className='border-gray-300' />
                            {user.role === 'admin' && (
                              <p onClick={()=>navigate('/admin')} className='text-blue-600 hover:text-blue-800 cursor-pointer'>Admin Panel</p>
                            )}
                            {user.role === 'doctor' && (
                              <p onClick={()=>navigate('/doctor')} className='text-blue-600 hover:text-blue-800 cursor-pointer'>Doctor Panel</p>
                            )}
                            <p onClick={()=>navigate('/my-profile')} className='hover:text-black cursor-pointer'>My Profile</p>
                            <p onClick={()=>navigate('/my-appointments')} className='hover:text-black cursor-pointer'>My Appointments</p>
                            <p onClick={handleLogout} className='hover:text-black cursor-pointer'>Logout</p>
                        </div>
                    </div>
                </div>
                :<button onClick={()=>navigate('/login')} type="button" className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-6 py-2.5 text-center me-2 mb-2">Login</button>
            }
        </div>
    </div>
  )
}

export default Navbar
