import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const RelatedDoctors = ({ Specialty, docId }) => {
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)

  const [relDocs, setRelDocs] = useState([])

  useEffect(() => {
    if (doctors.length > 0 && Specialty) {
      const normalizedSpecialty = Specialty.toLowerCase()
      const doctorsData = doctors.filter(
        (doc) => (doc.specialty || doc.speciality || '').toLowerCase() === normalizedSpecialty && doc._id !== docId
      )
      setRelDocs(doctorsData)
    }
  }, [doctors, Specialty, docId])

  return (
    <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
      <h1 className='text-3xl font-medium'>Related Doctors</h1>
      <p className='sm:w-1/3 text-center text-sm'>
        Simply browse through our extensive list of trusted doctors.
      </p>

      <div className='w-full grid grid-cols-auto gap-4 gap-y-6 px-3 sm:px-0'>
        {relDocs.slice(0, 5).map((item) => (
          <div
            onClick={() => {
              navigate(`/appointment/${item._id}`)
              scrollTo(0, 0)
            }}
            className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-500'
            key={item._id}
          >
            <img className='bg-blue-50 w-full' src={item.image} alt={item.name} />

            <div className='p-4'>
              <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : 'text-gray-500'}`}>
                <p className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : 'bg-gray-500'}`}></p>
                <p>{item.available ? 'Available' : 'Not Available'}</p>
              </div>

              <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
              <p className='text-gray-600 text-sm'>{item.specialty || item.speciality}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RelatedDoctors
