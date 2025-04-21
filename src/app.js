import express from "express";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import cors from "cors";
import { corsOptions } from "./constants.js";
import {router as userRouter} from './routes/auth.routes.js'
import {router as propertyRouter} from "./routes/property.routes.js"

// Initialize Express app
const app = express();

// Serve static files from the 'public/temp' directory
app.use(express.static("public/temp"));

// Parse URL-encoded bodies
app.use(express.urlencoded({
    limit: "16kb",
    extended: true
}));

// Parse JSON bodies
app.use(express.json({
    limit: "16kb",
    extended: true
}));

// Enable CORS with specified options
app.use(cors(corsOptions));

// Parse cookies
app.use(cookieParser());

// Set up rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000, // Limit each IP to 1000 requests per windowMs
    message: "Too many requests from this IP address. Try again later!",
    header: true
});

// Apply rate limiter to all requests
app.use(limiter);

// Set up routes
app.use("/api/auth", userRouter);
app.use("/api/properties", propertyRouter);

app.set("trust proxy", 1);


export {app};