import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api/axios'
import { parseApiError } from '../api/errors'
import { useAuth } from '../context/AuthContext'
import { useTenantNavigate } from '../context/TenantContext'
import { assets } from '../assets/assets'

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

// Local YYYY-MM-DD (avoids UTC shift from toISOString).
const fmtDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`

// "10:30 AM" — matches the backend's canonical slot format.
const fmtTime = (d) =>
  d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

// Build 7 days of 30-minute slots (10:00 AM – 9:00 PM), skipping past times today.
const buildSlots = () => {
  const days = []
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(now.getDate() + i)

    const end = new Date(date)
    end.setHours(21, 0, 0, 0)

    const cursor = new Date(date)
    if (i === 0) {
      // Today: start at the next half hour, but no earlier than 10:00.
      cursor.setHours(Math.max(now.getHours() + 1, 10))
      cursor.setMinutes(now.getMinutes() > 30 ? 30 : 0, 0, 0)
    } else {
      cursor.setHours(10, 0, 0, 0)
    }

    const slots = []
    while (cursor < end) {
      slots.push({ datetime: new Date(cursor), time: fmtTime(cursor) })
      cursor.setMinutes(cursor.getMinutes() + 30)
    }
    days.push(slots)
  }
  return days
}

const Appointment = () => {
  const { docId } = useParams()
  const navigate = useTenantNavigate()
  const { user } = useAuth()

  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const daySlots = useMemo(buildSlots, [])
  const [dayIndex, setDayIndex] = useState(0)
  const [selectedTime, setSelectedTime] = useState('')

  const [booking, setBooking] = useState(false)
  const [bookError, setBookError] = useState('')

  useEffect(() => {
    let ignore = false
    const load = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const { data } = await api.get(`/doctors/${docId}/`)
        if (!ignore) setDoctor(data)
      } catch (err) {
        if (!ignore)
          setLoadError(parseApiError(err, 'Could not load this doctor.'))
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [docId])

  const onBook = async () => {
    setBookError('')
    if (!user) {
      toast.info('Please login to book an appointment')
      navigate('/login')
      return
    }
    if (!selectedTime) {
      setBookError('Please select a time slot.')
      return
    }
    setBooking(true)
    try {
      const slotDate = fmtDate(daySlots[dayIndex][0].datetime)
      await api.post('/appointments/', {
        doctor: doctor.id,
        slot_date: slotDate,
        slot_time: selectedTime,
      })
      toast.success('Appointment booked successfully')
      navigate('/my-appointments')
    } catch (err) {
      setBookError(parseApiError(err, 'Could not book this appointment.'))
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return <p className='text-gray-500 py-16 text-center'>Loading…</p>
  }

  if (loadError || !doctor) {
    return (
      <div className='py-16 text-center'>
        <p className='text-red-500 mb-3'>{loadError || 'Doctor not found.'}</p>
        <button
          onClick={() => navigate('/doctors')}
          className='bg-blue-600 text-white px-6 py-2 rounded-full'
        >
          Back to doctors
        </button>
      </div>
    )
  }

  const activeSlots = daySlots[dayIndex] || []

  return (
    <div className='py-6'>
      {/* Doctor details */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img
            className='bg-blue-50 w-full sm:max-w-72 rounded-lg'
            src={doctor.image || assets.profile_pic}
            alt={doctor.name}
          />
        </div>

        <div className='flex-1 border border-gray-300 rounded-lg p-8 py-7 bg-white'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {doctor.name}
            <img className='w-5' src={assets.verified_icon} alt='' />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>
              {doctor.degree} - {doctor.speciality}
            </p>
            <span className='py-0.5 px-2 border text-xs rounded-full'>
              {doctor.experience}
            </span>
          </div>

          <p className='text-sm font-medium text-gray-900 mt-3'>About</p>
          <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{doctor.about}</p>

          <p className='text-gray-600 font-medium mt-4'>
            Appointment fee:{' '}
            <span className='text-gray-800'>${doctor.fees}</span>
          </p>

          <div className='mt-2 text-sm'>
            {doctor.available ? (
              <span className='text-green-600'>● Available</span>
            ) : (
              <span className='text-gray-500'>● Not accepting appointments</span>
            )}
          </div>
        </div>
      </div>

      {/* Booking slots */}
      <div className='sm:ml-72 sm:pl-4 mt-6 font-medium text-gray-700'>
        <p>Booking slots</p>

        {/* Days */}
        <div className='flex gap-3 items-center w-full overflow-x-auto mt-4'>
          {daySlots.map((slots, i) => (
            <div
              key={i}
              onClick={() => {
                setDayIndex(i)
                setSelectedTime('')
              }}
              className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                dayIndex === i
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200'
              }`}
            >
              <p>{slots[0] ? DAYS[slots[0].datetime.getDay()] : '-'}</p>
              <p>{slots[0] ? slots[0].datetime.getDate() : ''}</p>
            </div>
          ))}
        </div>

        {/* Times */}
        <div className='flex items-center gap-3 w-full overflow-x-auto mt-4'>
          {activeSlots.length === 0 && (
            <p className='text-sm text-gray-500'>No slots left for this day.</p>
          )}
          {activeSlots.map((slot) => (
            <p
              key={slot.time}
              onClick={() => setSelectedTime(slot.time)}
              className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                slot.time === selectedTime
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 border border-gray-300'
              }`}
            >
              {slot.time.toLowerCase()}
            </p>
          ))}
        </div>

        {bookError && (
          <p className='mt-4 bg-red-50 text-red-600 border border-red-200 rounded px-3 py-2 max-w-md'>
            {bookError}
          </p>
        )}

        <button
          onClick={onBook}
          disabled={booking || !doctor.available}
          className='bg-blue-600 text-white text-sm font-light px-14 py-3 rounded-full my-6 disabled:opacity-60'
        >
          {booking
            ? 'Booking…'
            : user
            ? 'Book an appointment'
            : 'Login to book'}
        </button>
      </div>
    </div>
  )
}

export default Appointment
