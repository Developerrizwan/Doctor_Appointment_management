import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../api/axios'
import { parseApiError } from '../api/errors'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../context/ConfirmContext'
import { useTenantNavigate } from '../context/TenantContext'
import { assets } from '../assets/assets'

const MyAppointments = () => {
  const { user } = useAuth()
  const confirm = useConfirm()
  const navigate = useTenantNavigate()

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState(null)

  // Guard: this page requires authentication.
  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  useEffect(() => {
    let ignore = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/appointments/')
        if (!ignore) setAppointments(data.results)
      } catch (err) {
        if (!ignore)
          setError(parseApiError(err, 'Could not load your appointments.'))
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    if (user) load()
    return () => {
      ignore = true
    }
  }, [user])

  // Both cancel and pay return the updated appointment; splice it back in.
  const act = async (id, action, successMsg) => {
    setActingId(id)
    setError('')
    try {
      const { data } = await api.post(`/appointments/${id}/${action}/`)
      setAppointments((list) => list.map((a) => (a.id === id ? data : a)))
      if (successMsg) toast.success(successMsg)
    } catch (err) {
      const msg = parseApiError(err, 'Action failed. Please try again.')
      setError(msg)
      toast.error(msg)
    } finally {
      setActingId(null)
    }
  }

  const handlePay = (id) => act(id, 'pay', 'Payment successful')

  const handleCancel = async (id) => {
    const ok = await confirm({
      title: 'Cancel appointment',
      message: 'Are you sure you want to cancel this appointment?',
      confirmText: 'Cancel appointment',
      cancelText: 'Keep it',
      tone: 'danger',
    })
    if (ok) act(id, 'cancel', 'Appointment cancelled')
  }

  if (loading) {
    return (
      <p className='text-gray-500 py-16 text-center'>Loading appointments…</p>
    )
  }

  return (
    <div className='py-6'>
      <p className='pb-3 font-medium text-zinc-700 border-b'>My appointments</p>

      {error && (
        <p className='mt-4 bg-red-50 text-red-600 border border-red-200 rounded px-3 py-2 max-w-lg'>
          {error}
        </p>
      )}

      {appointments.length === 0 ? (
        <p className='text-gray-500 py-16 text-center'>
          You have no appointments yet.{' '}
          <span
            onClick={() => navigate('/doctors')}
            className='text-blue-600 underline cursor-pointer'
          >
            Book one
          </span>
          .
        </p>
      ) : (
        appointments.map((a) => {
          const busy = actingId === a.id
          const doc = a.doctor
          return (
            <div
              key={a.id}
              className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'
            >
              <div>
                <img
                  className='w-32 bg-blue-50 rounded'
                  src={doc.image || assets.profile_pic}
                  alt={doc.name}
                />
              </div>

              <div className='flex-1 text-sm text-zinc-600'>
                <p className='text-neutral-800 font-semibold'>{doc.name}</p>
                <p>{doc.speciality}</p>
                <p className='text-zinc-700 font-medium mt-1'>Address:</p>
                <p className='text-xs'>{doc.address?.line1}</p>
                <p className='text-xs'>{doc.address?.line2}</p>
                <p className='text-xs mt-1'>
                  <span className='text-sm text-neutral-700 font-medium'>
                    Date &amp; Time:
                  </span>{' '}
                  {a.slot_date} | {a.slot_time}
                </p>
                <p className='text-xs mt-1'>
                  <span className='text-sm text-neutral-700 font-medium'>
                    Fee:
                  </span>{' '}
                  ${a.amount}
                </p>
              </div>

              <div className='flex flex-col gap-2 justify-end text-sm text-center min-w-[12rem]'>
                {a.cancelled ? (
                  <span className='border border-red-400 text-red-500 rounded py-2 px-4'>
                    Appointment cancelled
                  </span>
                ) : a.is_completed ? (
                  <span className='border border-green-500 text-green-600 rounded py-2 px-4'>
                    Completed
                  </span>
                ) : (
                  <>
                    {a.payment ? (
                      <span className='border rounded py-2 px-4 text-stone-500 bg-stone-100'>
                        Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePay(a.id)}
                        disabled={busy}
                        className='border rounded py-2 px-4 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-60'
                      >
                        {busy ? 'Please wait…' : 'Pay Online'}
                      </button>
                    )}
                    <button
                      onClick={() => handleCancel(a.id)}
                      disabled={busy}
                      className='border rounded py-2 px-4 hover:bg-red-600 hover:text-white transition-all disabled:opacity-60'
                    >
                      {busy ? 'Please wait…' : 'Cancel appointment'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

export default MyAppointments
