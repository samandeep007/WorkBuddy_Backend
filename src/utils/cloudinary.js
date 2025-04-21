import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import { cloudinaryOptions } from '../constants.js';
 
// Configure cloudinary with options from constants
cloudinary.config(cloudinaryOptions);

export default async function uploadOnCloudinary(localFilePath){
    try {
        if(!localFilePath) return null;
        // Upload file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("Upload on cloudinary successful", response.url);
        // Delete local file after successful upload
        fs.unlinkSync(localFilePath);
        return response;
        
    } catch (error) {
        console.error("Upload on cloudinary failed", error);
        // Delete local file if upload fails
        fs.unlinkSync(localFilePath);
        return null;
    }
}