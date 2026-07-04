import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useTenantNavigate } from '../context/TenantContext'

const TopDoctors = () => {
  const navigate = useTenantNavigate()

  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const { data } = await api.get('/doctors/')
        if (!ignore) setDoctors(data.results)
      } catch {
        if (!ignore) setError(true)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
      <h1 className='text-3xl font-medium'>Top Doctors to Book </h1>
      <p className='sm:w-1/3 text-center text-sm'>
        Simply Browse through our extensive list of trusted doctors.
      </p>

      {loading && <p className='text-gray-500 py-6'>Loading doctors…</p>}
      {error && !loading && (
        <p className='text-red-500 py-6'>Could not load doctors right now.</p>
      )}

      {!loading && !error && (
        <div className='w-full grid grid-cols-5 gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
          {doctors.slice(0, 10).map((item) => (
            <div
              onClick={() => navigate(`/appointment/${item.id}`)}
              className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'
              key={item.id}
            >
              <img className='bg-blue-50 w-full' src={item.image} alt={item.name} />
              <div className='p-4'>
                <div
                  className={`flex items-center gap-2 text-sm text-center ${
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
                <p className='text-gray-900 text-lg font-serif'>{item.name}</p>
                <p className='text-gray-950 text-sm font-serif'>{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          navigate('/doctors')
          scrollTo(0, 0)
        }}
        className='bg-blue-600 text-white px-12 py-3 rounded-full mt-5 hover:translate-y-[-10px] transition-all duration-500'
      >
        More
      </button>
    </div>
  )
}

export default TopDoctors
