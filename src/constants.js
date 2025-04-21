import "dotenv/config"; // Load environment variables from .env file

// CORS configuration options
const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
}

// Cloudinary configuration options
const cloudinaryOptions = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
}

// Database configuration options
const dbOptions = {
    mongodb_uri: process.env.MONGO_URI,
    db_name: process.env.DB_NAME
}

// Refresh token configuration
const refreshToken = {
    secret: process.env.REFRESH_TOKEN_SECRET,
    expiry: process.env.REFRESH_TOKEN_EXPIRY
}

// Access token configuration
const accessToken = {
    secret: process.env.ACCESS_TOKEN_SECRET,
    expiry: process.env.ACCESS_TOKEN_EXPIRY
}

export {corsOptions, cloudinaryOptions, dbOptions, refreshToken, accessToken}