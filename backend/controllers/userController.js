import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import userModel from '../models/userModels.js'
import doctorModel from '../models/doctorModels.js'
import appointmentModel from '../models/appointmentModels.js'
import { v2 as cloudinary } from 'cloudinary'

const getRazorpayInstance = () => {
	if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
		throw new Error('Razorpay keys are missing in environment variables')
	}

	return new Razorpay({
		key_id: process.env.RAZORPAY_KEY_ID,
		key_secret: process.env.RAZORPAY_KEY_SECRET,
	})
}
// API for user registration
const registerUser = async (req, res) => {
	try {
		const { name, email, password } = req.body

		if (!name || !email || !password) {
			return res.json({ success: false, message: 'Missing details' })
		}

		const isUserExist = await userModel.findOne({ email })
		if (isUserExist) {
			return res.json({ success: false, message: 'User already exists' })
		}

		// validating email format
		if (!validator.isEmail(email)) {
			return res.json({ success: false, message: 'enter a valid email' })
		}

		// validating strong password
		if (password.length < 8) {
			return res.json({ success: false, message: 'enter a strong password' })
		}

		// hashing user password
		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(password, salt)

		const userData = {
			name,
			email,
			password: hashedPassword,
		}

		const newUser = new userModel(userData)
		const user = await newUser.save()

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

		res.json({ success: true, token })
	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
}

// API for user login
const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body

		const user = await userModel.findOne({ email })
		if (!user) {
			return res.json({ success: false, message: 'User does not exist' })
		}

		const isMatch = await bcrypt.compare(password, user.password)
		if (isMatch) {
			const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
			res.json({ success: true, token })
		} else {
			res.json({ success: false, message: 'Invalid credentials' })
		}
	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
}

// API to get user profile data
const getProfile = async (req, res) => {
    try {
        const userId = req.userId
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {
	try {
		const userId = req.userId || req.body.userId
		const { name, phone, address, dob, gender } = req.body
		const imageFile = req.file

		if (!name || !phone || !address || !dob || !gender) {
			return res.json({ success: false, message: 'Data Missing' })
		}

		const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address

		await userModel.findByIdAndUpdate(userId, {
			name,
			phone,
			address: typeof address === 'string' ? JSON.parse(address) : address,
			dob,
			gender,
		})

		if (imageFile) {
			const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
				resource_type: 'image',
			})
			// there is a error in the updation of image kindly check it once
			const imageUrl = imageUpload.secure_url
			await userModel.findByIdAndUpdate(userId, { image: imageUrl })
		}

		res.json({ success: true, message: 'Profile Updated' })
	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
}

// API to book appointment
const bookAppointment = async (req, res) => {
	try {
		const userId = req.userId
		const { docId, slotDate, slotTime } = req.body

		const docData = await doctorModel.findById(docId).select('-password')

		if (!docData) {
			return res.json({ success: false, message: 'Doctor not found' })
		}

		if (!docData.available) {
			return res.json({ success: false, message: 'Doctor not available' })
		}

		let slots_booked = docData.slots_booked

		// checking for slot availability
		if (slots_booked[slotDate]) {
			if (slots_booked[slotDate].includes(slotTime)) {
				return res.json({ success: false, message: 'Slot not available' })
			} else {
				slots_booked[slotDate].push(slotTime)
			}
		} else {
			slots_booked[slotDate] = []
			slots_booked[slotDate].push(slotTime)
		}

		const userData = await userModel.findById(userId).select('-password')
		const docDataObj = docData.toObject()
		delete docDataObj.slots_booked

		const appointmentData = {
			userId,
			docId,
			userData,
			docData: docDataObj,
			amount: docData.fees,
			slotTime,
			slotDate,
			date: Date.now(),
		}

		const newAppointment = new appointmentModel(appointmentData)
		await newAppointment.save()

		// save new slots data in docData
		await doctorModel.findByIdAndUpdate(docId, { slots_booked })

		res.json({ success: true, message: 'Appointment Booked' })
	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
	try {
		const userId = req.userId || req.body.userId
		const appointments = await appointmentModel.find({ userId })

		res.json({ success: true, appointments })
	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
	try {
		const userId = req.userId || req.body.userId
		const { appointmentId } = req.body

		const appointmentData = await appointmentModel.findById(appointmentId)

		if (!appointmentData) {
			return res.json({ success: false, message: 'Appointment not found' })
		}

		// verify appointment user
		if (appointmentData.userId !== userId) {
			return res.json({ success: false, message: 'Unauthorized action' })
		}

		await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

		// releasing doctor slot
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

// API to mark appointment payment status
const payAppointment = async (req, res) => {
	try {
		const userId = req.userId || req.body.userId
		const { appointmentId } = req.body

		const appointmentData = await appointmentModel.findById(appointmentId)

		if (!appointmentData) {
			return res.json({ success: false, message: 'Appointment not found' })
		}

		if (appointmentData.userId !== userId) {
			return res.json({ success: false, message: 'Unauthorized action' })
		}

		if (appointmentData.cancelled) {
			return res.json({ success: false, message: 'Cancelled appointment cannot be paid' })
		}

		await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })

		res.json({ success: true, message: 'Payment Successful' })
	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
}

// API to create razorpay order for appointment payment
const paymentRazorpay = async (req, res) => {
	try {
		const userId = req.userId || req.body.userId
		const { appointmentId } = req.body

		const appointmentData = await appointmentModel.findById(appointmentId)

		if (!appointmentData) {
			return res.json({ success: false, message: 'Appointment not found' })
		}

		if (appointmentData.userId !== userId) {
			return res.json({ success: false, message: 'Unauthorized action' })
		}

		if (appointmentData.cancelled) {
			return res.json({ success: false, message: 'Cancelled appointment cannot be paid' })
		}

		if (appointmentData.payment) {
			return res.json({ success: false, message: 'Appointment is already paid' })
		}

		const razorpay = getRazorpayInstance()
		const options = {
			amount: Number(appointmentData.amount) * 100,
			currency: 'INR',
			receipt: appointmentId,
		}

		const order = await razorpay.orders.create(options)

		res.json({
			success: true,
			order,
			key: process.env.RAZORPAY_KEY_ID,
		})
	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
}

// API to verify razorpay payment and mark appointment paid
const verifyRazorpay = async (req, res) => {
	try {
		const userId = req.userId || req.body.userId
		const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body

		const appointmentData = await appointmentModel.findById(appointmentId)
		if (!appointmentData) {
			return res.json({ success: false, message: 'Appointment not found' })
		}

		if (appointmentData.userId !== userId) {
			return res.json({ success: false, message: 'Unauthorized action' })
		}

		const generatedSignature = crypto
			.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
			.update(`${razorpay_order_id}|${razorpay_payment_id}`)
			.digest('hex')

		if (generatedSignature !== razorpay_signature) {
			return res.json({ success: false, message: 'Payment verification failed' })
		}

		await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })

		res.json({ success: true, message: 'Payment Successful' })
	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
}



export {
	registerUser,
	loginUser,
	getProfile,
	updateProfile,
	bookAppointment,
	listAppointment,
	cancelAppointment,
	payAppointment,
	paymentRazorpay,
	verifyRazorpay,
}

 