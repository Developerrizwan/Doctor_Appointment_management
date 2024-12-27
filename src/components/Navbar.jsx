import React from 'react'
import {assets} from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const Navbar = () => {

    

    const navigate = useNavigate();

    const [showMenu, setShowMenu] = useState(false)
    const [token, setToken] = useState(true)  /* if it is logged in */

   // const handleNavigateToLogin = () => {
        //navigate('/login')
    //}

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-gray-400'>
        <img className='w-44 cursor-pointer' src={assets.logo} alt='' />

        <ul className='hidden md:flex items-start gap-5 font-medium'>

            <NavLink to='/'>
                <li className='py-1'>HOME</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>

            <NavLink to='/doctors'>
                <li className='py-1'>ALL DOCTORS</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>

            <NavLink to='/about'>
                <li className='py-1'>ABOUT</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>

            <NavLink to='/contact'>
                <li className='py-1'>CONTACT</li>
                <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
            </NavLink>

        </ul>
        <div className='flex items-center gap-4'>
            {
                token 
                ? 
                <div className='flex items-center gap-3 cursor-pointer group relative'>
                    <img className='w-8 rounded-full' src={assets.profile_pic} alt='' />
                    <img className='w-2.5' src= {assets.dropdown_icon} alt='' />
                    <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-60 hidden group-hover:block'>
                        <div className='min-w-40 bg-stone-100 rounded flex flex-col gap-3 p-4'>

                            <p onClick={()=>navigate('/my-profile')} className='hover:text-black cursor-pointer'>MY Profile</p>
                            <p onClick={()=>navigate('/my-appointments')} className='hover:text-black cursor-pointer'>MY Appointment</p>
                            <p onClick={()=>setToken(false)} className='hover:text-black cursor-pointer'>Logout</p>

                        </div>

                    </div>
                </div>
                :<button onClick={()=>navigate('/login')}  type="button" className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Create Account</button>
            }
            
        </div>
    </div>
  )
}

export default Navbar