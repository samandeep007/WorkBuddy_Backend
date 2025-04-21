import multer from 'multer';

// Configure multer disk storage
const storage = multer.diskStorage({
    // Set the destination for uploaded files
    destination: (req, file, cb) => {
        console.log("photo to aayi")
        cb(null, './public/temp');
    },

    // Use the original filename for the uploaded file
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// Create a multer instance with the configured storage
const upload = multer({storage: storage});
export default upload;