import {Router} from 'express';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import upload from "../middlewares/multer.middleware.js";
import {createProperty, editProperty, deleteProperty, viewProperty, getAllProperties, getUserProperties, deleteImage} from "../controllers/property.controller.js";

// Create a new router instance
const router = Router();

// Public route to get all properties
router.route("/all-properties").get(getAllProperties);

// Protected Routes (require JWT verification)
router.route("/").post(verifyJWT, upload.array('images', 5), createProperty); // Create a new property with up to 5 images
router.route("/view/:id").post(verifyJWT, viewProperty); // View a specific property
router.route("/edit/:id").patch(verifyJWT, upload.array("images", 5), editProperty); // Edit a property with up to 5 images
router.route("/edit/:id/images").delete(verifyJWT, deleteImage); // Delete an image from a property
router.route("/:id").delete(verifyJWT, deleteProperty); // Delete a property
router.route("/my-properties").post(verifyJWT, getUserProperties); // Get properties of the authenticated user

export {router};