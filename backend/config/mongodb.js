import mongoose from "mongoose";

const connectDB = async () => {
    const mongodbUri = process.env.MONGODB_URI;

    if (!mongodbUri) {
        throw new Error('MONGODB_URI is not set in backend/.env');
    }

    mongoose.connection.on('connected', () => {
        console.log('MongoDB connected successfully');
    })
    await mongoose.connect(`${mongodbUri}/prescripto`)
}

export default connectDB