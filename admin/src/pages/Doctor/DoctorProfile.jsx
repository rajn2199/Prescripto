import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, updateProfileData } = useContext(DoctorContext)
  const [isEdit, setIsEdit] = useState(false)

  useEffect(() => {
    if (dToken) {
      getProfileData()
    }
  }, [dToken])

  const handleSave = async () => {
    if (!profileData) return

    const success = await updateProfileData({
      fees: Number(profileData.fees),
      available: profileData.available,
      address: profileData.address,
    })

    if (success) {
      setIsEdit(false)
    }
  }

  const handleCancelEdit = async () => {
    await getProfileData()
    setIsEdit(false)
  }

  if (!profileData) {
    return <div className='w-full p-5 text-sm text-gray-500'>Loading profile...</div>
  }

  return (
    <div className='w-full p-5'>
      <div className='max-w-lg flex flex-col gap-2 text-sm'>
        <img className='w-36 rounded bg-gray-100' src={profileData.image} alt={profileData.name} />

        <p className='font-medium text-3xl text-neutral-800 mt-4'>{profileData.name}</p>
        <p className='text-blue-500'>{profileData.email}</p>
        <p className='text-gray-600'>{profileData.degree}</p>
        <p className='text-gray-600'>{profileData.specialty}</p>

        <hr className='bg-zinc-300 h-px border-none my-2' />

        <div>
          <p className='text-gray-600 underline mt-2'>PROFESSIONAL INFORMATION</p>
          <div className='grid grid-cols-[1fr_2fr] gap-y-2.5 mt-3 text-neutral-700'>
            <p className='font-medium'>Experience:</p>
            <p>{profileData.experience}</p>

            <p className='font-medium'>Fees:</p>
            {isEdit ? (
              <input
                className='max-w-28 bg-gray-50 border rounded px-2 py-1'
                type='number'
                value={profileData.fees}
                onChange={(e) => setProfileData((prev) => ({ ...prev, fees: e.target.value }))}
              />
            ) : (
              <p>${profileData.fees}</p>
            )}

            <p className='font-medium'>Availability:</p>
            {isEdit ? (
              <select
                className='max-w-32 bg-gray-50 border rounded px-2 py-1'
                value={String(profileData.available)}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, available: e.target.value === 'true' }))
                }
              >
                <option value='true'>Available</option>
                <option value='false'>Not Available</option>
              </select>
            ) : (
              <p>{profileData.available ? 'Available' : 'Not Available'}</p>
            )}
          </div>
        </div>

        <div>
          <p className='text-gray-600 underline mt-3'>ADDRESS</p>
          {isEdit ? (
            <div className='mt-3 flex flex-col gap-2'>
              <input
                className='bg-gray-50 border rounded px-3 py-2'
                type='text'
                value={profileData.address?.line1 || ''}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value },
                  }))
                }
              />
              <input
                className='bg-gray-50 border rounded px-3 py-2'
                type='text'
                value={profileData.address?.line2 || ''}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value },
                  }))
                }
              />
            </div>
          ) : (
            <p className='text-gray-500 mt-3'>
              {profileData.address?.line1}
              <br />
              {profileData.address?.line2}
            </p>
          )}
        </div>

        <div className='mt-6 flex items-center gap-3'>
          {isEdit ? (
            <>
              <button
                onClick={handleSave}
                className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className='border border-gray-300 px-8 py-2 rounded-full hover:bg-gray-100 transition-all'
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEdit(true)}
              className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
