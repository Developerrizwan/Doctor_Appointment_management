import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { parseApiError } from '../api/errors'
import { useTenant, useTenantNavigate } from '../context/TenantContext'

const Login = () => {
  const [mode, setMode] = useState('Login') // 'Sign Up' | 'Login'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { login, register } = useAuth()
  const { slug } = useTenant()
  const navigate = useTenantNavigate()

  const isSignUp = mode === 'Sign Up'

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (isSignUp) {
        await register(name, email, password)
      } else {
        await login(email, password)
      }
      toast.success(isSignUp ? 'Account created — welcome!' : 'Welcome back!')
      navigate('/')
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>
          {isSignUp ? 'Create Account' : 'Login'}
        </p>
        <p>
          Please {isSignUp ? 'sign up' : 'log in'} to book an appointment at{' '}
          <span className='font-medium text-gray-800'>{slug}</span>.
        </p>

        {error && (
          <p className='w-full bg-red-50 text-red-600 border border-red-200 rounded px-3 py-2'>
            {error}
          </p>
        )}

        {isSignUp && (
          <div className='w-full'>
            <p>Full Name</p>
            <input
              className='border border-zinc-300 rounded w-full p-2 mt-1'
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className='w-full'>
          <p>Email</p>
          <input
            className='border border-zinc-300 rounded w-full p-2 mt-1'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className='w-full'>
          <p>Password</p>
          <div className='relative'>
            <input
              className='border border-zinc-300 rounded w-full p-2 mt-1 pr-16'
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              onClick={() => setShowPassword((s) => !s)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 cursor-pointer select-none'
            >
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>
        </div>

        <button
          type='submit'
          disabled={submitting}
          className='bg-blue-600 text-white w-full py-2 rounded-md text-base disabled:opacity-60'
        >
          {submitting
            ? 'Please wait…'
            : isSignUp
            ? 'Create Account'
            : 'Login'}
        </button>

        {isSignUp ? (
          <p>
            Already have an account?{' '}
            <span
              onClick={() => {
                setMode('Login')
                setError('')
              }}
              className='text-blue-600 underline cursor-pointer'
            >
              Login here
            </span>
          </p>
        ) : (
          <p>
            Don&apos;t have an account?{' '}
            <span
              onClick={() => {
                setMode('Sign Up')
                setError('')
              }}
              className='text-blue-600 underline cursor-pointer'
            >
              Sign up
            </span>
          </p>
        )}
      </div>
    </form>
  )
}

export default Login
