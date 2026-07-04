import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import platformApi, { isPlatformAuthed, platformStore } from '../../api/platform'
import { parseApiError } from '../../api/errors'
import { useConfirm } from '../../context/ConfirmContext'
import PlatformNav from './PlatformNav'

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
}

const fetchAllHospitals = async () => {
  const all = []
  let url = '/hospitals/'
  while (url) {
    const { data } = await platformApi.get(url)
    all.push(...data.results)
    url = data.next
  }
  return all
}

const PlatformDashboard = () => {
  const navigate = useNavigate()
  const confirm = useConfirm()

  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all') // 'all' | 'pending'
  const [actingId, setActingId] = useState(null)

  useEffect(() => {
    if (!isPlatformAuthed()) {
      navigate('/platform/login')
      return
    }
    let ignore = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const list = await fetchAllHospitals()
        if (!ignore) setHospitals(list)
      } catch (err) {
        if (ignore) return
        if (err.response?.status === 401) {
          platformStore.clear()
          navigate('/platform/login')
          return
        }
        setError(parseApiError(err, 'Could not load hospitals.'))
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [navigate])

  const act = async (id, action) => {
    setActingId(id)
    setError('')
    try {
      const { data } = await platformApi.post(`/hospitals/${id}/${action}/`)
      setHospitals((list) => list.map((h) => (h.id === id ? data : h)))
      toast.success(action === 'approve' ? 'Hospital approved' : 'Hospital suspended')
    } catch (err) {
      const msg = parseApiError(err, 'Action failed.')
      setError(msg)
      toast.error(msg)
    } finally {
      setActingId(null)
    }
  }

  const approve = (h) => act(h.id, 'approve')
  const suspend = async (h) => {
    const ok = await confirm({
      title: 'Suspend hospital',
      message: `Suspend ${h.name}? It will stop resolving until re-approved.`,
      confirmText: 'Suspend',
      tone: 'danger',
    })
    if (ok) act(h.id, 'suspend')
  }

  const pendingCount = hospitals.filter((h) => h.status === 'pending').length
  const shown = tab === 'pending'
    ? hospitals.filter((h) => h.status === 'pending')
    : hospitals

  return (
    <div className='min-h-screen bg-gray-50'>
      <PlatformNav />
      <div className='p-6 max-w-6xl mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-xl font-semibold text-gray-800'>Hospitals</h1>
          <div className='flex gap-2 text-sm'>
            <button onClick={() => setTab('all')}
              className={`px-4 py-1.5 rounded-full ${tab === 'all' ? 'bg-blue-600 text-white' : 'border'}`}>
              All ({hospitals.length})
            </button>
            <button onClick={() => setTab('pending')}
              className={`px-4 py-1.5 rounded-full ${tab === 'pending' ? 'bg-blue-600 text-white' : 'border'}`}>
              Pending ({pendingCount})
            </button>
          </div>
        </div>

        {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}
        {loading ? (
          <p className='text-gray-500'>Loading hospitals…</p>
        ) : (
          <div className='bg-white border rounded-lg overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 text-gray-600 text-left'>
                <tr>
                  <th className='p-3'>Hospital</th>
                  <th className='p-3'>Slug</th>
                  <th className='p-3'>Plan</th>
                  <th className='p-3'>Status</th>
                  <th className='p-3'>Active</th>
                  <th className='p-3'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((h) => (
                  <tr key={h.id} className='border-t'>
                    <td className='p-3 text-gray-800'>
                      {h.name}
                      {h.contact_email && (
                        <div className='text-xs text-gray-400'>{h.contact_email}</div>
                      )}
                    </td>
                    <td className='p-3 text-gray-500'>/{h.slug}</td>
                    <td className='p-3 text-gray-500 capitalize'>{h.plan}</td>
                    <td className='p-3'>
                      <span className={`text-xs px-2 py-1 rounded-full border capitalize ${STATUS_STYLES[h.status] || ''}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className='p-3'>{h.is_active ? '✅' : '—'}</td>
                    <td className='p-3'>
                      <div className='flex gap-2'>
                        {h.status !== 'approved' && (
                          <button onClick={() => approve(h)} disabled={actingId === h.id}
                            className='text-green-600 border border-green-400 rounded px-3 py-1 text-xs hover:bg-green-600 hover:text-white transition-all disabled:opacity-60'>
                            {actingId === h.id ? '…' : 'Approve'}
                          </button>
                        )}
                        {h.status !== 'suspended' && (
                          <button onClick={() => suspend(h)} disabled={actingId === h.id}
                            className='text-red-500 border border-red-300 rounded px-3 py-1 text-xs hover:bg-red-500 hover:text-white transition-all disabled:opacity-60'>
                            {actingId === h.id ? '…' : 'Suspend'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {shown.length === 0 && (
                  <tr><td colSpan={6} className='p-4 text-center text-gray-500'>No hospitals.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlatformDashboard
