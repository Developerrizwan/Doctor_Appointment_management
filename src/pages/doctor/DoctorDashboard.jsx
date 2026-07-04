import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import { parseApiError } from '../../api/errors'

const StatCard = ({ label, value }) => (
  <div className='bg-white border rounded-lg p-5 flex-1 min-w-[8rem]'>
    <p className='text-2xl font-semibold text-gray-800'>{value}</p>
    <p className='text-gray-500 text-sm mt-1'>{label}</p>
  </div>
)

const DoctorDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const { data } = await api.get('/dashboard/doctor/')
        if (!ignore) setData(data)
      } catch (err) {
        if (!ignore) setError(parseApiError(err, 'Could not load dashboard.'))
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  if (loading) return <p className='text-gray-500'>Loading dashboard…</p>
  if (error) return <p className='text-red-500'>{error}</p>

  return (
    <div className='flex flex-col gap-6'>
      <h2 className='text-xl font-semibold text-gray-800'>Overview</h2>

      <div className='flex flex-wrap gap-4'>
        <StatCard label='Earnings' value={`$${data.earnings}`} />
        <StatCard label='Appointments' value={data.appointments} />
        <StatCard label='Patients' value={data.patients} />
      </div>

      <div className='bg-white border rounded-lg p-5'>
        <p className='font-medium text-gray-800 mb-4'>Latest appointments</p>
        <div className='flex flex-col gap-2'>
          {data.latest_appointments.length === 0 && (
            <p className='text-sm text-gray-500'>No appointments yet.</p>
          )}
          {data.latest_appointments.map((a) => (
            <div key={a.id} className='flex items-center justify-between text-sm border-b py-2'>
              <div>
                <p className='text-gray-800'>{a.patient?.name || 'Patient'}</p>
                <p className='text-gray-500 text-xs'>{a.slot_date} | {a.slot_time}</p>
              </div>
              <Status a={a} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const Status = ({ a }) => {
  let text = 'Booked'
  let cls = 'bg-blue-50 text-blue-600'
  if (a.cancelled) { text = 'Cancelled'; cls = 'bg-red-50 text-red-600' }
  else if (a.is_completed) { text = 'Completed'; cls = 'bg-green-50 text-green-600' }
  else if (a.payment) { text = 'Paid'; cls = 'bg-stone-100 text-stone-600' }
  return <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>{text}</span>
}

export default DoctorDashboard
