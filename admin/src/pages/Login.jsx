import React, { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {
  const [state, setState] = useState('Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { setAToken, backendUrl } = useContext(AdminContext)
  const { setDToken } = useContext(DoctorContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (state === 'Admin') {
        const { data } = await axios.post(`${backendUrl}/api/admin/login`, {
          email,
          password,
        })

        if (data.success) {
          localStorage.removeItem('dToken')
          setDToken('')
          localStorage.setItem('aToken', data.token)
          setAToken(data.token)
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/doctor/login`, {
          email,
          password,
        })

        if (data.success) {
          localStorage.removeItem('aToken')
          setAToken('')
          localStorage.setItem('dToken', data.token)
          setDToken(data.token)
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-screen flex items-center bg-[#f8f8fb]'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border border-gray-200 rounded-xl text-zinc-600 text-sm bg-white shadow-sm'>
        <p className='text-3xl font-medium m-auto text-zinc-700'>
          <span className='text-primary'>{state}</span> Login
        </p>

        <div className='w-full'>
          <label htmlFor='email' className='block text-zinc-600'>
            Email
          </label>
          <input
            id='email'
            name='email'
            className='border border-zinc-300 rounded w-full p-2 mt-1 outline-none focus:border-primary'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className='w-full'>
          <label htmlFor='password' className='block text-zinc-600'>
            Password
          </label>
          <input
            id='password'
            name='password'
            className='border border-zinc-300 rounded w-full p-2 mt-1 outline-none focus:border-primary'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type='submit' className='bg-primary text-white w-full py-2.5 rounded-md text-base'>
          Login
        </button>

        {state === 'Admin' ? (
          <p>
            Doctor Login?{' '}
            <span
              className='text-primary underline cursor-pointer'
              onClick={() => setState('Doctor')}
            >
              Click here
            </span>
          </p>
        ) : (
          <p>
            Admin Login?{' '}
            <span
              className='text-primary underline cursor-pointer'
              onClick={() => setState('Admin')}
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  )
}

export default Login
