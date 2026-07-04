import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicNav from './PublicNav'
import { PLANS } from '../../config/plans'

const Feature = ({ title, children }) => (
  <div className='border rounded-xl p-6 bg-white'>
    <p className='font-semibold text-gray-800'>{title}</p>
    <p className='text-sm text-gray-600 mt-2'>{children}</p>
  </div>
)

const Landing = () => {
  const navigate = useNavigate()
  const [slug, setSlug] = useState('')

  const goToHospital = (e) => {
    e.preventDefault()
    const s = slug.trim().toLowerCase()
    if (s) navigate(`/${s}`)
  }

  return (
    <div className='mx-4 sm:mx-[8%]'>
      <PublicNav />

      {/* Hero */}
      <section className='text-center py-16 md:py-24'>
        <h1 className='text-3xl md:text-5xl font-semibold text-gray-900 leading-tight'>
          Appointment booking software <br className='hidden md:block' />
          for modern hospitals
        </h1>
        <p className='text-gray-600 mt-5 max-w-2xl mx-auto'>
          Forwation gives every hospital its own branded space to manage doctors,
          patients, and appointments — set up in minutes, no infrastructure required.
        </p>
        <div className='flex flex-wrap items-center justify-center gap-3 mt-8'>
          <button
            onClick={() => navigate('/signup')}
            className='bg-blue-600 text-white px-8 py-3 rounded-full'
          >
            Get started free
          </button>
          <a href='#pricing' className='px-8 py-3 rounded-full border border-gray-300 text-gray-700'>
            See pricing
          </a>
        </div>

        {/* Existing hospital shortcut */}
        <form onSubmit={goToHospital} className='mt-8 flex items-center justify-center gap-2 text-sm'>
          <span className='text-gray-500'>Already registered?</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder='your-hospital'
            className='border rounded-full px-4 py-2'
          />
          <button className='text-blue-600 underline'>Go to your hospital →</button>
        </form>
      </section>

      {/* Features */}
      <section className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <Feature title='Your own tenant'>
          Each hospital gets an isolated space at its own URL. Data never crosses
          between hospitals.
        </Feature>
        <Feature title='Doctors & scheduling'>
          Manage doctors by speciality and let patients book available slots with
          double-booking protection.
        </Feature>
        <Feature title='Role-based access'>
          Hospital admins, doctors, and patients each get exactly the tools they need.
        </Feature>
      </section>

      {/* Pricing */}
      <section id='pricing' className='py-16'>
        <div className='text-center mb-10'>
          <h2 className='text-3xl font-semibold text-gray-900'>Simple pricing</h2>
          <p className='text-gray-600 mt-2'>Pick a plan when you sign up. Change anytime.</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto'>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-8 flex flex-col bg-white ${
                plan.highlighted ? 'border-blue-600 shadow-lg ring-1 ring-blue-200' : 'border-gray-200'
              }`}
            >
              {plan.highlighted && (
                <span className='self-start text-xs bg-blue-600 text-white px-3 py-1 rounded-full mb-3'>
                  Most popular
                </span>
              )}
              <p className='text-lg font-semibold text-gray-800'>{plan.name}</p>
              <p className='text-sm text-gray-500 mt-1'>{plan.tagline}</p>
              <p className='mt-4'>
                <span className='text-4xl font-bold text-gray-900'>{plan.price}</span>
                <span className='text-gray-500'>{plan.period}</span>
              </p>
              <ul className='flex flex-col gap-2 mt-6 text-sm text-gray-600 flex-1'>
                {plan.features.map((f) => (
                  <li key={f} className='flex items-center gap-2'>
                    <span className='text-green-500'>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate(`/signup?plan=${plan.id}`)}
                className={`mt-8 py-3 rounded-full ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-800'
                }`}
              >
                Get started
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className='border-t border-gray-300 py-8 text-center text-sm text-gray-500'>
        © 2026 Forwation — appointment software for hospitals.
        <span className='mx-2'>·</span>
        <span
          onClick={() => navigate('/platform/login')}
          className='text-gray-400 hover:text-gray-600 cursor-pointer underline'
        >
          Platform owner
        </span>
      </footer>
    </div>
  )
}

export default Landing
