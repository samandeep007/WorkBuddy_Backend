import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import PropertyModel from "../models/property.model.js";

// Handler for creating a new property
const createProperty = asyncHandler(async (req, res) => {
    const {title, address, propertyType, area, tags, hasParking, isAccessible, isAvailable, capacity, leaseTerm, price} = req.body;
    // Validate required fields
    if([title, address, propertyType, area, tags, capacity, leaseTerm, price].some(field => !field)){
        throw new ApiError(400, "All fields are required");
    }
    
    const images = req.files;
    let propertyImages = [];
    
    // Upload images to Cloudinary if provided
    if (images && images.length > 0) {
        for (const image of images) {
            const uploadedImage = await uploadOnCloudinary(image.path);
            propertyImages.push(uploadedImage.url);
        }
    }

    // Create new property in database
    const newProperty = await PropertyModel.create({
        owner: req.user._id,
        title: title,
        address: address,
        propertyType: propertyType,
        area: Number(area),
        tags: tags.split(", "),
        images: propertyImages,
        price: Number(price),
        hasParking: hasParking,
        isAccessible: isAccessible,
        isAvailable: isAvailable,
        capacity: Number(capacity),
        leaseTerm: leaseTerm
    });

    return res
            .status(200)
            .json(new ApiResponse(200, "Property added successfully", newProperty)); 
})

// Handler for viewing a specific property
const viewProperty = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find property by ID
    const property = await PropertyModel.findById(id);

    if (!property) {
        throw new ApiError(404, "Property not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Property retrieved successfully", property));
});

// Handler for editing an existing property
const editProperty = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, address, propertyType, area, tags, hasParking, isAccessible, isAvailable, capacity, leaseTerm, price } = req.body;

    // Find property by ID
    let property = await PropertyModel.findById(id);

    if (!property) {
        throw new ApiError(404, "Property not found");
    }

    // Update property fields if provided
    if (title) property.title = title;
    if (address) property.address = address;
    if (propertyType) property.propertyType = propertyType;
    if (price) property.price = price;
    if (area) property.area = Number(area);
    if (tags) property.tags = tags.split(", ");
    if (hasParking !== undefined) property.hasParking = hasParking;
    if (isAccessible !== undefined) property.isAccessible = isAccessible;
    if (isAvailable !== undefined) property.isAvailable = isAvailable;
    if (capacity) property.capacity = Number(capacity);
    if (leaseTerm) property.leaseTerm = leaseTerm;

    // Handle new images if provided
    const images = req.files;
    let propertyImages = property.images || []; 
    if (images && images.length > 0) {
        for (const image of images) {
            const uploadedImage = await uploadOnCloudinary(image.path);
            propertyImages.push(uploadedImage.url);
        }
    }

    property.images = propertyImages;

    // Save updated property
    await property.save();

    return res
        .status(200)
        .json(new ApiResponse(200, "Property updated successfully", property));
});

// Handler for deleting a property
const deleteProperty = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params; 

    if (!id) {
        throw new ApiError(400, "Property ID is required");
    }

    // Find the property by ID
    const property = await PropertyModel.findById(id);

    if (!property) {
        throw new ApiError(404, "Property not found");
    }

    // Check if the logged-in user is the owner of the property
    if (property.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this property");
    }

    // Delete the property
    await PropertyModel.findByIdAndDelete(id);

    return res
        .status(200)
        .json(new ApiResponse(200, "Property deleted successfully"));
});

// Handler for getting all properties with pagination and filtering
const getAllProperties = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', filters = {} } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Build the query
    const query = PropertyModel.find(filters)
        .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

    // Execute the query and get the total count for pagination
    const [properties, total] = await Promise.all([
        query.exec(),
        PropertyModel.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    return res
        .status(200)
        .json(new ApiResponse(200, "Properties retrieved successfully", {
            properties,
            page: pageNumber,
            totalPages,
            total
        }));
});

// Handler for getting properties of a specific user
const getUserProperties = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', filters = {} } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    filters.owner = userId;

    // Build and execute query
    const query = PropertyModel.find(filters)
        .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

    const [properties, total] = await Promise.all([
        query.exec(),
        PropertyModel.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    return res
        .status(200)
        .json(new ApiResponse(200, "User properties retrieved successfully", {
            properties,
            page: pageNumber,
            totalPages,
            total
        }));
});

// Handler for deleting an image from a property
const deleteImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { imageUrl } = req.body;

    // Assuming you have a method to remove image from your database
    await removeImageFromProperty(propertyId, imageUrl);

    res.status(200).json({ message: "Image deleted successfully" });
})

export {createProperty, editProperty, deleteProperty, viewProperty, getAllProperties, getUserProperties, deleteImage};