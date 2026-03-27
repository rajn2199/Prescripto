import validator from 'validator'
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModels.js'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModels.js'
import userModel from '../models/userModels.js'

const addDoctor = async (req, res) => {
    try {

        // Debug - remove after fixing
        console.log('req.body:', req.body)
        console.log('req.body keys:', Object.keys(req.body || {}))
        console.log('req.file:', req.file)

        // Helper with trimmed key matching
        const getField = (fieldname) => {
            if (!req.body) return null

            // Direct match
            if (req.body[fieldname]) return req.body[fieldname]

            // Trimmed key match (fixes trailing space issue)
            const match = Object.entries(req.body).find(
                ([key]) => key.trim() === fieldname.trim()
            )
            return match ? match[1] : null
        }

        const imageFile = req.file

        const name       = getField('name')
        const email      = getField('email')
        const password   = getField('password')
        const speciality = getField('speciality') || getField('specialty')
        const degree     = getField('degree')
        const experience = getField('experience')
        const about      = getField('about')
        const fees       = getField('fees')
        const address    = getField('address')

        console.log({ name, email, password, speciality, degree, experience, about, fees, address })
        console.log('imageFile:', imageFile)

        const requiredFields = {
            name,
            email,
            password,
            specialty: speciality,
            degree,
            experience,
            about,
            fees,
            address,
            image: imageFile
        }

        const missingFields = Object.entries(requiredFields)
            .filter(([, value]) => !value)
            .map(([field]) => field)

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing Details',
                missingFields
            })
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please enter a valid email' })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: 'Please enter a strong password' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: 'image'
        })
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            specialty: speciality,
            degree,
            experience,
            about,
            fees: Number(fees),
            address: typeof address === 'string' ? JSON.parse(address) : address,
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        res.json({ success: true, message: 'Doctor Added' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for adminLogin
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel appointment by admin
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        if (appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment already cancelled' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // release the booked slot for the doctor
        const { docId, slotDate, slotTime } = appointmentData
        const doctorData = await doctorModel.findById(docId)

        if (doctorData) {
            const slots_booked = doctorData.slots_booked || {}
            if (slots_booked[slotDate]) {
                slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime)
            }

            await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        }

        res.json({ success: true, message: 'Appointment Cancelled' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {
        const [doctors, users, appointments] = await Promise.all([
            doctorModel.find({}),
            userModel.find({}),
            appointmentModel.find({}),
        ])

        const latestAppointments = [...appointments]
            .sort((a, b) => b.date - a.date)
            .slice(0, 5)

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments,
        }

        res.json({ success: true, dashData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}



export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard }