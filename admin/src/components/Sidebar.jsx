import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'

const Sidebar = () => {
	const { aToken } = useContext(AdminContext)
	const { dToken } = useContext(DoctorContext)

	const linkClass = ({ isActive }) =>
		`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer border-r-4 ${
			isActive ? 'bg-[#F2F3FF] border-[#5F6FFF]' : 'border-white'
		}`

	return (
		<div className='min-h-screen bg-white border-r border-[#E5E7EB] w-16 sm:w-64'>
			{aToken && (
				<ul className='text-[#515151] mt-5'>
					<NavLink className={linkClass} to='/admin-dashboard'>
						<img className='w-5 h-5' src={assets.home_icon} alt='' />
						<p className='hidden sm:block'>Dashboard</p>
					</NavLink>

					<NavLink className={linkClass} to='/all-appointment'>
						<img className='w-5 h-5' src={assets.appointment_icon} alt='' />
						<p className='hidden sm:block'>Appointments</p>
					</NavLink>

					<NavLink className={linkClass} to='/add-doctor'>
						<img className='w-5 h-5' src={assets.add_icon} alt='' />
						<p className='hidden sm:block'>Add Doctor</p>
					</NavLink>

					<NavLink className={linkClass} to='/doctor-list'>
						<img className='w-5 h-5' src={assets.people_icon} alt='' />
						<p className='hidden sm:block'>Doctors List</p>
					</NavLink>
				</ul>
			)}

			{dToken && (
				<ul className='text-[#515151] mt-5'>
					<NavLink className={linkClass} to='/doctor-dashboard'>
						<img className='w-5 h-5' src={assets.home_icon} alt='' />
						<p className='hidden sm:block'>Dashboard</p>
					</NavLink>

					<NavLink className={linkClass} to='/doctor-appointments'>
						<img className='w-5 h-5' src={assets.appointment_icon} alt='' />
						<p className='hidden sm:block'>Appointments</p>
					</NavLink>

					<NavLink className={linkClass} to='/doctor-profile'>
						<img className='w-5 h-5' src={assets.people_icon} alt='' />
						<p className='hidden sm:block'>Profile</p>
					</NavLink>
				</ul>
			)}
		</div>
	)
}

export default Sidebar
