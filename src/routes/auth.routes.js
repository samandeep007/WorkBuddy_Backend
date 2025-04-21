import { Router } from "express";
import { register, login, logout, changePassword, updateUserDetails, refreshAccessToken, getCurrentUser, getUserById } from "../controllers/auth.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Create a new router instance
const router = Router();

// Public routes
router.route("/register").post(upload.single("avatar"), register); // Register new user with avatar upload
router.route("/login").post(login); // User login

// Protected Routes (require JWT verification)
router.route("/logout").post(verifyJWT, logout); // User logout
router.route("/change-password").post(verifyJWT, changePassword); // Change user password
router.route("/update-user").post(verifyJWT, upload.single("avatar"), updateUserDetails); // Update user details with avatar upload
router.route("/refresh-session").get(verifyJWT, refreshAccessToken); // Refresh user's access token
router.route("/me").get(verifyJWT, getCurrentUser); // Get current user's details
router.route('/user/:id').post(verifyJWT, getUserById); // Get user by ID

export { router };