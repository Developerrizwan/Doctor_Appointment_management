import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { fetchAllResults } from '../../api/fetchAll'
import { parseApiError } from '../../api/errors'
import { useConfirm } from '../../context/ConfirmContext'

const emptyForm = {
  email: '',
  password: '',
  name: '',
  speciality: '',
  degree: '',
  experience: '',
  fees: '',
  about: '',
  address_line1: '',
  address_line2: '',
  available: true,
}

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([])
  const [specialities, setSpecialities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const confirm = useConfirm()

  const loadDoctors = async () => {
    const list = await fetchAllResults('/doctors/')
    setDoctors(list)
  }

  useEffect(() => {
    let ignore = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [specs] = await Promise.all([api.get('/specialities/')])
        if (ignore) return
        setSpecialities(specs.data)
        await loadDoctors()
      } catch (err) {
        if (!ignore) setError(parseApiError(err, 'Could not load doctors.'))
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  const onField = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }

  const toggleAvailability = async (doc) => {
    setError('')
    try {
      const { data } = await api.patch(`/doctors/${doc.id}/`, {
        available: !doc.available,
      })
      setDoctors((list) => list.map((d) => (d.id === doc.id ? data : d)))
      toast.success(
        data.available ? `${data.name} is now available` : `${data.name} paused`
      )
    } catch (err) {
      const msg = parseApiError(err, 'Could not update availability.')
      setError(msg)
      toast.error(msg)
    }
  }

  const removeDoctor = async (doc) => {
    const ok = await confirm({
      title: 'Remove doctor',
      message: `Remove ${doc.name}? This permanently deletes their account too.`,
      confirmText: 'Remove',
      tone: 'danger',
    })
    if (!ok) return
    setError('')
    try {
      await api.delete(`/doctors/${doc.id}/`)
      setDoctors((list) => list.filter((d) => d.id !== doc.id))
      toast.success(`${doc.name} removed`)
    } catch (err) {
      const msg = parseApiError(err, 'Could not remove doctor.')
      setError(msg)
      toast.error(msg)
    }
  }

  const submitForm = async (e) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('email', form.email)
      fd.append('password', form.password)
      fd.append('name', form.name)
      fd.append('speciality', form.speciality)
      fd.append('degree', form.degree)
      fd.append('experience', form.experience)
      fd.append('fees', form.fees)
      fd.append('about', form.about)
      fd.append('address_line1', form.address_line1)
      fd.append('address_line2', form.address_line2)
      fd.append('available', form.available ? 'true' : 'false')
      if (imageFile) fd.append('image', imageFile)

      await api.post('/doctors/', fd)
      setForm(emptyForm)
      setImageFile(null)
      setShowForm(false)
      await loadDoctors()
      toast.success('Doctor added')
    } catch (err) {
      setFormError(parseApiError(err, 'Could not add doctor.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className='text-gray-500'>Loading doctors…</p>

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-gray-800'>Doctors ({doctors.length})</h2>
        <button
          onClick={() => { setShowForm((s) => !s); setFormError('') }}
          className='bg-blue-600 text-white px-4 py-2 rounded-full text-sm'
        >
          {showForm ? 'Close' : 'Add doctor'}
        </button>
      </div>

      {error && <p className='text-red-500 text-sm'>{error}</p>}

      {showForm && (
        <form onSubmit={submitForm} className='bg-white border rounded-lg p-5 grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {formError && (
            <p className='sm:col-span-2 bg-red-50 text-red-600 border border-red-200 rounded px-3 py-2'>
              {formError}
            </p>
          )}
          <Input label='Email' type='email' value={form.email} onChange={onField('email')} required />
          <Input label='Password' type='password' value={form.password} onChange={onField('password')} required />
          <Input label='Full name' value={form.name} onChange={onField('name')} required />

          <div className='flex flex-col gap-1 text-sm'>
            <label className='text-gray-600'>Speciality</label>
            <select value={form.speciality} onChange={onField('speciality')} required className='border rounded p-2'>
              <option value=''>Select…</option>
              {specialities.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <Input label='Degree' value={form.degree} onChange={onField('degree')} />
          <Input label='Experience (e.g. 4 Years)' value={form.experience} onChange={onField('experience')} />
          <Input label='Fees' type='number' step='0.01' value={form.fees} onChange={onField('fees')} required />

          <div className='flex flex-col gap-1 text-sm'>
            <label className='text-gray-600'>Photo</label>
            <input type='file' accept='image/*' onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          </div>

          <Input label='Address line 1' value={form.address_line1} onChange={onField('address_line1')} />
          <Input label='Address line 2' value={form.address_line2} onChange={onField('address_line2')} />

          <div className='flex flex-col gap-1 text-sm sm:col-span-2'>
            <label className='text-gray-600'>About</label>
            <textarea value={form.about} onChange={onField('about')} rows={3} className='border rounded p-2' />
          </div>

          <label className='flex items-center gap-2 text-sm text-gray-600'>
            <input type='checkbox' checked={form.available} onChange={onField('available')} />
            Available for booking
          </label>

          <div className='sm:col-span-2'>
            <button disabled={saving} className='bg-blue-600 text-white px-6 py-2 rounded-full disabled:opacity-60'>
              {saving ? 'Saving…' : 'Create doctor'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {doctors.map((d) => (
          <div key={d.id} className='bg-white border rounded-lg overflow-hidden'>
            <img className='w-full h-40 object-cover bg-blue-50' src={d.image} alt={d.name} />
            <div className='p-4 text-sm'>
              <p className='font-medium text-gray-800'>{d.name}</p>
              <p className='text-gray-500'>{d.speciality}</p>
              <p className='text-gray-500'>${d.fees} · {d.experience}</p>
              <label className='flex items-center gap-2 mt-2 text-gray-600'>
                <input type='checkbox' checked={d.available} onChange={() => toggleAvailability(d)} />
                {d.available ? 'Available' : 'Not available'}
              </label>
              <button
                onClick={() => removeDoctor(d)}
                className='mt-3 text-red-500 border border-red-300 rounded px-3 py-1 text-xs hover:bg-red-500 hover:text-white transition-all'
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Input = ({ label, ...props }) => (
  <div className='flex flex-col gap-1 text-sm'>
    <label className='text-gray-600'>{label}</label>
    <input {...props} className='border rounded p-2' />
  </div>
)

export default AdminDoctors
