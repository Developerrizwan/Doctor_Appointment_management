import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { fetchAllResults } from '../../api/fetchAll'
import { parseApiError } from '../../api/errors'
import { useConfirm } from '../../context/ConfirmContext'

const statusOf = (a) => {
  if (a.cancelled) return { text: 'Cancelled', cls: 'bg-red-50 text-red-600' }
  if (a.is_completed) return { text: 'Completed', cls: 'bg-green-50 text-green-600' }
  if (a.payment) return { text: 'Paid', cls: 'bg-stone-100 text-stone-600' }
  return { text: 'Booked', cls: 'bg-blue-50 text-blue-600' }
}

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState(null)
  const confirm = useConfirm()

  useEffect(() => {
    let ignore = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const list = await fetchAllResults('/appointments/')
        if (!ignore) setAppointments(list)
      } catch (err) {
        if (!ignore) setError(parseApiError(err, 'Could not load appointments.'))
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  const cancel = async (id) => {
    const ok = await confirm({
      title: 'Cancel appointment',
      message: 'Cancel this appointment on behalf of the patient?',
      confirmText: 'Cancel appointment',
      cancelText: 'Keep it',
      tone: 'danger',
    })
    if (!ok) return
    setActingId(id)
    setError('')
    try {
      const { data } = await api.post(`/appointments/${id}/cancel/`)
      setAppointments((list) => list.map((a) => (a.id === id ? data : a)))
      toast.success('Appointment cancelled')
    } catch (err) {
      const msg = parseApiError(err, 'Could not cancel.')
      setError(msg)
      toast.error(msg)
    } finally {
      setActingId(null)
    }
  }

  if (loading) return <p className='text-gray-500'>Loading appointments…</p>

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-xl font-semibold text-gray-800'>
        All appointments ({appointments.length})
      </h2>
      {error && <p className='text-red-500 text-sm'>{error}</p>}

      <div className='bg-white border rounded-lg overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50 text-gray-600 text-left'>
            <tr>
              <th className='p-3'>Patient</th>
              <th className='p-3'>Doctor</th>
              <th className='p-3'>Speciality</th>
              <th className='p-3'>Date &amp; time</th>
              <th className='p-3'>Fee</th>
              <th className='p-3'>Status</th>
              <th className='p-3'>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => {
              const s = statusOf(a)
              const closed = a.cancelled || a.is_completed
              return (
                <tr key={a.id} className='border-t'>
                  <td className='p-3 text-gray-800'>{a.patient?.name}</td>
                  <td className='p-3 text-gray-800'>{a.doctor.name}</td>
                  <td className='p-3 text-gray-500'>{a.doctor.speciality}</td>
                  <td className='p-3 text-gray-500'>{a.slot_date} | {a.slot_time}</td>
                  <td className='p-3 text-gray-500'>${a.amount}</td>
                  <td className='p-3'>
                    <span className={`text-xs px-2 py-1 rounded-full ${s.cls}`}>{s.text}</span>
                  </td>
                  <td className='p-3'>
                    {!closed && (
                      <button
                        onClick={() => cancel(a.id)}
                        disabled={actingId === a.id}
                        className='text-red-500 border border-red-300 rounded px-3 py-1 text-xs hover:bg-red-500 hover:text-white transition-all disabled:opacity-60'
                      >
                        {actingId === a.id ? '…' : 'Cancel'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {appointments.length === 0 && (
              <tr><td colSpan={7} className='p-4 text-center text-gray-500'>No appointments.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminAppointments
