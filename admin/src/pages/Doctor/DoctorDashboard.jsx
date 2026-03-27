import React, { useContext, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData , completeAppointment, cancelAppointment} = useContext(DoctorContext)
  const { slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getDashData()
    }
  }, [dToken])

  return (
    <div className='w-full p-4 sm:p-6 bg-[#F8F8FF] min-h-[calc(100vh-73px)]'>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl'>
        <div className='flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-md px-4 py-4 min-h-21'>
          <img className='w-10' src={assets.earning_icon} alt='earnings' />
          <div>
            <p className='text-xl font-semibold text-[#374151]'>${dashData?.earnings || 0}</p>
            <p className='text-sm text-[#6B7280]'>Earnings</p>
          </div>
        </div>

        <div className='flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-md px-4 py-4 min-h-21'>
          <img className='w-10' src={assets.appointments_icon} alt='appointments' />
          <div>
            <p className='text-xl font-semibold text-[#374151]'>{dashData?.appointments || 0}</p>
            <p className='text-sm text-[#6B7280]'>Appointments</p>
          </div>
        </div>

        <div className='flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-md px-4 py-4 min-h-21'>
          <img className='w-10' src={assets.patients_icon} alt='patients' />
          <div>
            <p className='text-xl font-semibold text-[#374151]'>{dashData?.patients || 0}</p>
            <p className='text-sm text-[#6B7280]'>Patients</p>
          </div>
        </div>
      </div>

      <div className='mt-6 max-w-4xl bg-white border border-[#E5E7EB] rounded-md'>
        <div className='flex items-center gap-2 px-4 py-3 border-b border-[#E5E7EB] text-[#374151]'>
          <img className='w-4 h-4' src={assets.list_icon} alt='latest appointments' />
          <p className='font-medium text-sm'>Latest Bookings</p>
        </div>

        <div className='px-2 sm:px-4'>
          {dashData?.latestAppointments?.map((item) => (
            <div
              key={item._id}
              className='flex items-center justify-between py-3 border-b last:border-b-0'
            >
              <div className='flex items-center gap-3'>
                <img
                  className='w-10 h-10 rounded-full object-cover bg-gray-200'
                  src={item.userData?.image || assets.patients_icon}
                  alt={item.userData?.name || 'patient'}
                />
                <div>
                  <p className='text-sm font-medium text-[#374151]'>{item.userData?.name || 'N/A'}</p>
                  <p className='text-xs text-[#6B7280]'>Booking on {slotDateFormat(item.slotDate)}</p>
                </div>
              </div>

              {item.cancelled ? (
                <p className='text-red-400 text-xs font-medium'>Cancelled</p>
              ) : item.isCompleted ? (
                <p className='text-green-500 text-xs font-medium'>Completed</p>
              ) : (
                <div className='flex items-center gap-2'>
                  <img
                    onClick={() => cancelAppointment(item._id)}
                    className='w-10 cursor-pointer'
                    src={assets.cancel_icon}
                    alt='cancel appointment'
                  />
                  <img
                    onClick={() => completeAppointment(item._id)}
                    className='w-10 cursor-pointer'
                    src={assets.tick_icon}
                    alt='complete appointment'
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
