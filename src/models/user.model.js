import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { refreshToken, accessToken } from "../constants.js";

// Define the User Schema
const UserSchema = new Schema({
    fullName: {
        type: String,
        required: [true, "Full Name is required"],
        trim: true
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true
    },

    phone: {
        type: Number,
        required: [true, "Phone Number is required"]
    },

    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true,
        trim: true
    },

    avatar: {
        type: String,
        required: true,
        trim: true
    },

    isOwner: {
        type: Boolean,
        required: true
    },

    refreshToken: String

}, { timestamps: true });

// Pre-save middleware to hash password
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to validate password
UserSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate access token
UserSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        fullName: this.fullName,
        email: this.email,
        username: this.username,
        isOwner: this.isOwner
    }, accessToken.secret, {
        expiresIn: accessToken.expiry
    })
}

// Method to generate refresh token
UserSchema.methods.generateRefreshToken = function() {
    return jwt.sign({
        _id: this._id
    }, refreshToken.secret, {
        expiresIn: refreshToken.expiry
    })
}

// Create the User model
const UserModel = mongoose.models.users || mongoose.model("User", UserSchema);
export default UserModel;