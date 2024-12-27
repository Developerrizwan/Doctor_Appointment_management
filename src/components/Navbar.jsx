import React from 'react'
import {assets} from '../assets/assets'
import { NavLink } from 'react-router-dom'


const Navbar = () => {
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
        <div>
            <button type="button" className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Create Account</button>
        </div>
    </div>
  )
}

export default Navbar