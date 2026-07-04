import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import { useTenantNavigate } from '../context/TenantContext'
import { specialityData } from '../assets/assets'

// Convert a speciality display name (or an existing slug) to the API slug.
// "General physician" -> "general-physician"; idempotent on an already-slugged value.
const toSlug = (value) => value.toLowerCase().trim().replace(/\s+/g, '-')

const Doctors = () => {
  const { speciality } = useParams()
  const navigate = useTenantNavigate()

  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    const fetchDoctors = async () => {
      setLoading(true)
      setError(null)
      try {
        // Hit ?speciality=<slug> only when a speciality is selected.
        const params = speciality ? { speciality: toSlug(speciality) } : {}
        const { data } = await api.get('/doctors/', { params })
        if (!ignore) setDoctors(data.results)
      } catch (err) {
        if (!ignore) setError('Could not load doctors. Please try again.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchDoctors()
    return () => {
      ignore = true
    }
  }, [speciality])

  const activeSlug = speciality ? toSlug(speciality) : null

  return (
    <div className='py-6'>
      <p className='text-gray-600'>Browse through the doctors specialist.</p>

      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        {/* Speciality filter */}
        <div className='flex flex-col gap-3 text-sm text-gray-600 min-w-[12rem]'>
          {specialityData.map((item) => {
            const slug = toSlug(item.speciality)
            const isActive = activeSlug === slug
            return (
              <p
                key={item.speciality}
                onClick={() =>
                  isActive ? navigate('/doctors') : navigate(`/doctors/${slug}`)
                }
                className={`pl-3 py-1.5 pr-4 border border-gray-300 rounded transition-all cursor-pointer ${
                  isActive ? 'bg-blue-100 text-black' : ''
                }`}
              >
                {item.speciality}
              </p>
            )
          })}
        </div>

        {/* Results */}
        <div className='w-full'>
          {loading && (
            <p className='text-gray-500 py-10 text-center'>Loading doctors…</p>
          )}

          {error && !loading && (
            <div className='py-10 text-center'>
              <p className='text-red-500 mb-3'>{error}</p>
              <button
                onClick={() => navigate(0)}
                className='bg-blue-600 text-white px-6 py-2 rounded-full'
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && doctors.length === 0 && (
            <p className='text-gray-500 py-10 text-center'>
              No doctors found for this speciality.
            </p>
          )}

          {!loading && !error && doctors.length > 0 && (
            <div className='grid grid-cols-auto sm:grid-cols-3 gap-4 gap-y-6'>
              {doctors.map((item) => (
                <div
                  onClick={() => navigate(`/appointment/${item.id}`)}
                  key={item.id}
                  className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'
                >
                  <img className='bg-blue-50 w-full' src={item.image} alt={item.name} />
                  <div className='p-4'>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        item.available ? 'text-green-500' : 'text-gray-500'
                      }`}
                    >
                      <p
                        className={`w-2 h-2 rounded-full ${
                          item.available ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      ></p>
                      <p>{item.available ? 'Available' : 'Not Available'}</p>
                    </div>
                    <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                    <p className='text-gray-600 text-sm'>{item.speciality}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Doctors
