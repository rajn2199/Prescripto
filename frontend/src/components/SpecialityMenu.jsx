import React from 'react'
import { Link } from 'react-router-dom'
import { specialityData } from '../assets/assets_frontend/assets'

const SpecialityMenu = () => {
  return (
    <div className='flex flex-col items-center gap-4 py-16 text-gray-800' id='Specialty'>
        <h1 className='text-3xl font-medium'>Find by Specialty</h1>
        <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of trusted doctors, schedule <br /> your appointment hassle-free.</p>
        <div className='flex sm:justify-center gap-4 pt-5 w-full overflow-scroll'>
          {specialityData.map((item, index) => (
            <Link onClick={() => scrollTo(0, 0)} className='flex flex-col items-center text-xs cursor-pointer shrink-0 hover:-translate-y-2.5 transition-all duration-500' key={index} to={`/doctors/${item.Specialty}`}>
                    <img className='w-16 sm:w-24 mb-2' src={item.image} alt={item.Specialty} />
                    <p>{item.Specialty}</p>
                </Link>
            ))}
        </div>
      
    </div>
  )
}

export default SpecialityMenu
