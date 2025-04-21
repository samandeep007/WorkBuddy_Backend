import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Function to generate access and refresh tokens for a user
const generateAccessAndRefreshToken = async (id) => {
    try {
        const user = await UserModel.findById(id);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };

    } catch (error) {
        console.error("auth.controller.js :: generateAccessAndRefreshToken() :: Failed to generate tokens", error);
        throw new ApiError(500, "Failed to generate tokens");
    }
}

// Handler for user registration
const register = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, isOwner, phone } = req.body;

    // Validate required fields
    if ([fullName, email, username, password, phone].some(field => !field || field === "")) {
        throw new ApiError(400, "All fields are required");
    }
    
    // Check if user already exists
    const user = await UserModel.findOne({ $or: [{ email }, { username }] });

    if (user) {
        throw new ApiError(400, "User already exists");
    }

    // Handle avatar upload
    const avatarLocalPath = req.file?.path;
    const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;

    // Create new user
    const newUser = await UserModel.create({
        fullName: fullName,
        username: username,
        email: email,
        phone: Number(phone),
        password: password,
        avatar: avatar?.url || `https://ui-avatars.com/api/?name=${fullName.split(" ").join("+")}`,
        isOwner: isOwner
    });

    // Fetch registered user without password
    const registeredUser = await UserModel.findById(newUser._id)?.select("-password");

    if (!registeredUser) {
        throw new ApiError(500, "User Registration failed")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "User Registration successful", registeredUser))
});

// Handler for user login
const login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    // Validate required fields
    if (!identifier || !password) {
        throw new ApiError(400, "All fields are required!");
    }

    // Find user by email or username
    const user = await UserModel.findOne({ $or: [{ email: identifier }, { username: identifier }] });

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    // Validate password
    const isValidPassword = await user.isValidPassword(password);

    if (!isValidPassword) {
        throw new ApiError(400, "Incorrect Password. Try again!");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const options = {
        httpOnly: true,
        secure: true
    }

    // Fetch logged in user without sensitive information
    const loggedInUser = await UserModel.findById(user._id).select("-password -refreshToken");

    // Send response with tokens in cookies
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, "User login successful", { loggedInUser, refreshToken, accessToken }));
});

// Handler to get current user details
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user._id).select('-password -refreshToken');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json({ user });
    }
  });

// Handler for user logout
const logout = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    // Remove refresh token from user document
    const user = await UserModel.findByIdAndUpdate(userId, {
        $unset: {
            refreshToken: 1
        }
    }, { new: true });

    const options = {
        httpOnly: true,
        secure: true
    }

    // Clear cookies and send response
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User logout successful", {}));
});

// Handler for changing user password
const changePassword = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "All fields are required");
    }
    const user = await UserModel.findById(userId);

    // Validate current password
    const isValidPassword = await user.isValidPassword(currentPassword);
    if (!isValidPassword) {
        throw new ApiError(400, "Incorrect Password. Try again!");
    }

    // Update password
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, "Password changed successfully", {}));
});

// Handler for updating user details
const updateUserDetails = asyncHandler(async (req, res) => {
    const { fullName, username } = req.body;
    const avatarLocalPath = req.file?.path;

    // Create userDetails object
    const userDetails = {
        fullName,
        username,
        ...(avatarLocalPath && { avatar: avatarLocalPath })
    };

    // Filter out empty fields
    const newUserDetails = Object.entries(userDetails).filter(([_, value]) => value?.trim() !== "");
    
    try {
        const user = await UserModel.findById(req.user.id);

        // Update user properties
        for (const [key, value] of newUserDetails) {
            if (key === "avatar" && avatarLocalPath) {
                // Upload avatar to Cloudinary
                const avatar = await uploadOnCloudinary(value);
                user.avatar = avatar.url;
            } else {
                user[key] = value;
            }
        }

        await user.save({ validateBeforeSave: false });
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                {},
                "User details updated successfully"
            ));
    } catch (error) {
        throw new ApiError(400, "Something went wrong while updating the user details");
    }
});

// Handler for refreshing access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(402, "unauthorized request");
    }

    // Verify refresh token
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await UserModel.findById(decodedToken?._id);

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
        httpOnly: true,
        secure: true,
    };

    // Generate new tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Send response with new tokens
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Access token refreshed"
            )
        );
});

// Handler to get user by ID
const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "User ID is required");
    }
    const user = await UserModel.findById(id).select('-password -refreshToken'); 

    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "User fetched successfully", user));
});

export {register, login, logout, changePassword, updateUserDetails, refreshAccessToken, getCurrentUser, getUserById}