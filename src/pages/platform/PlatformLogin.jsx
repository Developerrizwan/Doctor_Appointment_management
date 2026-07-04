import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import platformApi, { platformStore } from '../../api/platform'
import { parseApiError } from '../../api/errors'
import PlatformNav from './PlatformNav'

const PlatformLogin = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data } = await platformApi.post('/auth/login/', { email, password })
      platformStore.set(data.access, data.user)
      toast.success('Signed in to platform console')
      navigate('/platform')
    } catch (err) {
      setError(parseApiError(err, 'Login failed.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <PlatformNav showLogout={false} />
      <form onSubmit={onSubmit} className='min-h-[70vh] flex items-center'>
        <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl bg-white text-zinc-600 text-sm shadow-lg'>
          <p className='text-2xl font-semibold'>Platform Owner Login</p>
          <p>Sign in to create and approve hospitals.</p>

          {error && (
            <p className='w-full bg-red-50 text-red-600 border border-red-200 rounded px-3 py-2'>
              {error}
            </p>
          )}

          <div className='w-full'>
            <p>Email</p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1' type='email'
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className='w-full'>
            <p>Password</p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1' type='password'
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type='submit' disabled={submitting}
            className='bg-blue-600 text-white w-full py-2 rounded-md text-base disabled:opacity-60'>
            {submitting ? 'Please wait…' : 'Login'}
          </button>
          <p className='text-xs text-gray-400'>
            This is the cross-tenant owner account — not a hospital login.
          </p>
        </div>
      </form>
    </div>
  )
}

export default PlatformLogin
