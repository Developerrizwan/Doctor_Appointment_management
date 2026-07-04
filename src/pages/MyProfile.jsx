import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../api/axios'
import { parseApiError } from '../api/errors'
import { useAuth } from '../context/AuthContext'
import { useTenantNavigate } from '../context/TenantContext'
import { assets } from '../assets/assets'

const GENDER_OPTIONS = ['Not Selected', 'Male', 'Female', 'Other']

const emptyForm = {
  name: '',
  phone: '',
  gender: 'Not Selected',
  dob: '',
  address_line1: '',
  address_line2: '',
}

const MyProfile = () => {
  const { user, updateUser } = useAuth()
  const navigate = useTenantNavigate()

  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Guard: this page requires authentication.
  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  // Load the profile from the API (protected GET — exercises the refresh flow).
  useEffect(() => {
    let ignore = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/auth/profile/')
        if (ignore) return
        setProfile(data)
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          gender: data.gender || 'Not Selected',
          dob: data.dob || '',
          address_line1: data.address?.line1 || '',
          address_line2: data.address?.line2 || '',
        })
      } catch (err) {
        if (!ignore) setError(parseApiError(err, 'Could not load your profile.'))
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    if (user) load()
    return () => {
      ignore = true
    }
  }, [user])

  const onField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const onPickImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const cancelEdit = () => {
    setEditing(false)
    setError('')
    setImageFile(null)
    setImagePreview(null)
    // Reset the form back to the loaded profile.
    if (profile) {
      setForm({
        name: profile.name || '',
        phone: profile.phone || '',
        gender: profile.gender || 'Not Selected',
        dob: profile.dob || '',
        address_line1: profile.address?.line1 || '',
        address_line2: profile.address?.line2 || '',
      })
    }
  }

  const onSave = async () => {
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('phone', form.phone)
      fd.append('gender', form.gender)
      fd.append('address_line1', form.address_line1)
      fd.append('address_line2', form.address_line2)
      // Only send dob when set — an empty string is not a valid date.
      if (form.dob) fd.append('dob', form.dob)
      if (imageFile) fd.append('image', imageFile)

      const { data } = await api.patch('/auth/profile/', fd)
      setProfile(data)
      updateUser(data) // refresh the cached user (Navbar avatar/name)
      setEditing(false)
      setImageFile(null)
      setImagePreview(null)
      toast.success('Profile updated')
    } catch (err) {
      setError(parseApiError(err, 'Could not save your profile.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className='text-gray-500 py-16 text-center'>Loading profile…</p>
  }

  if (error && !profile) {
    return (
      <div className='py-16 text-center'>
        <p className='text-red-500 mb-3'>{error}</p>
        <button
          onClick={() => navigate(0)}
          className='bg-blue-600 text-white px-6 py-2 rounded-full'
        >
          Retry
        </button>
      </div>
    )
  }

  if (!profile) return null

  const displayImage = imagePreview || profile.image || assets.profile_pic

  return (
    <div className='max-w-lg flex flex-col gap-3 text-sm py-8'>
      {error && (
        <p className='bg-red-50 text-red-600 border border-red-200 rounded px-3 py-2'>
          {error}
        </p>
      )}

      {/* Avatar */}
      {editing ? (
        <label htmlFor='profile-image' className='inline-block cursor-pointer w-fit'>
          <img
            className='w-36 h-36 rounded object-cover opacity-90'
            src={displayImage}
            alt=''
          />
          <p className='text-blue-600 mt-1'>Change photo</p>
          <input
            id='profile-image'
            type='file'
            accept='image/*'
            hidden
            onChange={onPickImage}
          />
        </label>
      ) : (
        <img className='w-36 h-36 rounded object-cover' src={displayImage} alt='' />
      )}

      {/* Name */}
      {editing ? (
        <input
          className='bg-gray-50 text-3xl font-medium max-w-60 border rounded p-1 mt-4'
          value={form.name}
          onChange={onField('name')}
        />
      ) : (
        <p className='font-medium text-3xl text-neutral-800 mt-4'>{profile.name}</p>
      )}

      <hr className='bg-zinc-400 h-[1px] border-none' />

      <div>
        <p className='text-neutral-500 underline mt-3'>CONTACT INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Email:</p>
          <p className='text-blue-500'>{profile.email}</p>

          <p className='font-medium'>Phone:</p>
          {editing ? (
            <input
              className='bg-gray-50 border rounded p-1 max-w-52'
              value={form.phone}
              onChange={onField('phone')}
            />
          ) : (
            <p className='text-blue-400'>{profile.phone || '-'}</p>
          )}

          <p className='font-medium'>Address:</p>
          {editing ? (
            <div className='flex flex-col gap-1'>
              <input
                className='bg-gray-50 border rounded p-1'
                value={form.address_line1}
                onChange={onField('address_line1')}
                placeholder='Line 1'
              />
              <input
                className='bg-gray-50 border rounded p-1'
                value={form.address_line2}
                onChange={onField('address_line2')}
                placeholder='Line 2'
              />
            </div>
          ) : (
            <p className='text-gray-500'>
              {profile.address?.line1 || '-'}
              <br />
              {profile.address?.line2 || ''}
            </p>
          )}
        </div>
      </div>

      <div>
        <p className='text-neutral-500 underline mt-3'>BASIC INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Gender:</p>
          {editing ? (
            <select
              className='bg-gray-50 border rounded p-1 max-w-40'
              value={form.gender}
              onChange={onField('gender')}
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          ) : (
            <p className='text-gray-400'>{profile.gender || 'Not Selected'}</p>
          )}

          <p className='font-medium'>Birthday:</p>
          {editing ? (
            <input
              className='bg-gray-50 border rounded p-1 max-w-40'
              type='date'
              value={form.dob}
              onChange={onField('dob')}
            />
          ) : (
            <p className='text-gray-400'>{profile.dob || '-'}</p>
          )}
        </div>
      </div>

      <div className='mt-6 flex gap-3'>
        {editing ? (
          <>
            <button
              onClick={onSave}
              disabled={saving}
              className='border border-blue-600 bg-blue-600 text-white px-8 py-2 rounded-full disabled:opacity-60'
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={cancelEdit}
              disabled={saving}
              className='border border-gray-400 px-8 py-2 rounded-full'
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className='border border-blue-600 px-8 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all'
          >
            Edit
          </button>
        )}
      </div>
    </div>
  )
}

export default MyProfile
