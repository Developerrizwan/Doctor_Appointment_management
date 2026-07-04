import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { parseApiError } from '../../api/errors'
import { PLANS, PLAN_IDS } from '../../config/plans'
import PublicNav from './PublicNav'

const Field = ({ label, children }) => (
  <div className='flex flex-col gap-1 text-sm'>
    <label className='text-gray-600'>{label}</label>
    {children}
  </div>
)

const HospitalSignup = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialPlan = PLAN_IDS.includes(params.get('plan')) ? params.get('plan') : 'free'

  const [form, setForm] = useState({
    name: '',
    slug: '',
    plan: initialPlan,
    contact_email: '',
    contact_phone: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
  })
  const [slugState, setSlugState] = useState(null) // {available, message} | 'checking'
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(null) // confirmation payload

  const onField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  // Live slug availability check (debounced).
  useEffect(() => {
    const slug = form.slug.trim()
    if (!slug) {
      setSlugState(null)
      return
    }
    setSlugState('checking')
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get('/public/slug-check/', { params: { slug } })
        setSlugState({ available: data.available, message: data.message })
      } catch {
        setSlugState(null)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [form.slug])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (slugState && !slugState.available) {
      setError('Please choose an available hospital URL.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/public/signup/', form)
      setDone(data)
      toast.success('Hospital created — pending approval')
    } catch (err) {
      setError(parseApiError(err, 'Could not create your hospital.'))
    } finally {
      setSubmitting(false)
    }
  }

  // Confirmation screen.
  if (done) {
    return (
      <div className='mx-4 sm:mx-[8%]'>
        <PublicNav />
        <div className='max-w-lg mx-auto text-center py-20'>
          <div className='text-5xl mb-4'>🎉</div>
          <h1 className='text-2xl font-semibold text-gray-900'>
            Thanks — your hospital is pending approval
          </h1>
          <p className='text-gray-600 mt-3'>
            <b>{done.hospital.name}</b> was created on the{' '}
            <b className='capitalize'>{done.hospital.plan}</b> plan at{' '}
            <code className='bg-gray-100 px-1 rounded'>/{done.hospital.slug}</code>.
          </p>
          <div className='mt-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 text-sm'>
            <b>Your hospital isn't live yet.</b> New hospitals are reviewed before they
            go online. Once an administrator approves it, your admin login below will
            start working and you can add doctors.
          </div>
          <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
            <button
              onClick={() => navigate(`/${done.hospital.slug}/login`)}
              className='bg-blue-600 text-white px-8 py-3 rounded-full'
            >
              Go to your hospital login →
            </button>
            <button
              onClick={() => navigate('/')}
              className='px-8 py-3 rounded-full border border-gray-300 text-gray-700'
            >
              Back to home
            </button>
          </div>
          <p className='text-xs text-gray-400 mt-3'>
            Login URL: <code>/{done.hospital.slug}/login</code> (active after approval)
          </p>
        </div>
      </div>
    )
  }

  const slugHint = () => {
    if (slugState === 'checking') return <span className='text-gray-400'>Checking…</span>
    if (!slugState) return null
    return (
      <span className={slugState.available ? 'text-green-600' : 'text-red-500'}>
        {slugState.available ? '✓ ' : '✕ '}
        {slugState.message}
      </span>
    )
  }

  return (
    <div className='mx-4 sm:mx-[8%]'>
      <PublicNav />
      <div className='max-w-2xl mx-auto py-10'>
        <h1 className='text-2xl font-semibold text-gray-900'>Create your hospital</h1>
        <p className='text-gray-600 mt-1 text-sm'>
          Set up your hospital's space. It stays <b>pending</b> until approved — you
          won't be charged and it isn't live until then.
        </p>

        {error && (
          <p className='mt-4 bg-red-50 text-red-600 border border-red-200 rounded px-3 py-2 text-sm'>
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='sm:col-span-2'>
            <Field label='Hospital name'>
              <input className='border rounded p-2' value={form.name}
                onChange={onField('name')} required />
            </Field>
          </div>

          <div className='sm:col-span-2'>
            <Field label='Hospital URL (slug)'>
              <div className='flex items-center gap-2'>
                <span className='text-gray-400 text-sm'>forwation.app/</span>
                <input className='border rounded p-2 flex-1' value={form.slug}
                  onChange={onField('slug')} placeholder='green-valley' required />
              </div>
              <div className='text-xs mt-1'>{slugHint()}</div>
            </Field>
          </div>

          <Field label='Plan'>
            <select className='border rounded p-2' value={form.plan} onChange={onField('plan')}>
              {PLANS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.price}{p.period}
                </option>
              ))}
            </select>
          </Field>
          <Field label='Contact phone'>
            <input className='border rounded p-2' value={form.contact_phone}
              onChange={onField('contact_phone')} />
          </Field>
          <div className='sm:col-span-2'>
            <Field label='Contact email'>
              <input className='border rounded p-2' type='email' value={form.contact_email}
                onChange={onField('contact_email')} />
            </Field>
          </div>

          <div className='sm:col-span-2 border-t pt-4 mt-2'>
            <p className='font-medium text-gray-800'>First administrator</p>
            <p className='text-xs text-gray-500'>This account manages your hospital once approved.</p>
          </div>
          <Field label='Admin name'>
            <input className='border rounded p-2' value={form.admin_name}
              onChange={onField('admin_name')} required />
          </Field>
          <Field label='Admin email'>
            <input className='border rounded p-2' type='email' value={form.admin_email}
              onChange={onField('admin_email')} required />
          </Field>
          <div className='sm:col-span-2'>
            <Field label='Admin password'>
              <input className='border rounded p-2' type='password' value={form.admin_password}
                onChange={onField('admin_password')} required />
            </Field>
          </div>

          <div className='sm:col-span-2'>
            <button disabled={submitting}
              className='bg-blue-600 text-white px-8 py-3 rounded-full disabled:opacity-60'>
              {submitting ? 'Creating…' : 'Create hospital'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HospitalSignup
