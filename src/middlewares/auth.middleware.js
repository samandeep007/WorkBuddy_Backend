import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import UserModel from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    // Extract access token from cookies or Authorization header
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
    // If no access token is found, throw an unauthorized error
    if (!accessToken) {
        throw new ApiError(401, "Unauthorized Access");
    }
    
    // Verify the JWT token
    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    
    // Find the user in the database, excluding password and refreshToken fields
    const user = await UserModel.findById(decodedToken?._id)?.select("-password -refreshToken");
    
    // If no user is found, throw an invalid token error
    if (!user) {
        throw new ApiError(400, "Invalid Access Token");
    }
    
    // Attach the user object to the request for use in subsequent middleware or route handlers
    req.user = user;
    
    // Pass control to the next middleware
    next();
})