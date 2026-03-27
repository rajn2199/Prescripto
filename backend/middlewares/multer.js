import multer from 'multer'
import fs from 'fs'

// Create uploads folder if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads')
}

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads/')   // ✅ save to project uploads folder
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '-' + file.originalname)
    },
})

const upload = multer({ storage })

export default upload