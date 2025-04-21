import mongoose, {Schema} from "mongoose";

// Define the Property Schema
const PropertySchema = new Schema({
    // Reference to the owner (user) of the property
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },

    // Title of the property
    title: {
        type: String,
        required: true,
        trim: true
    },

    // Address of the property
    address: {
        type: String,
        required: true,
        trim: true
    },

    // Type of property (Meeting Room, Private Office Room, or Desk)
    propertyType: {
        type: String,
        required: true,
        trim: true,
        enum: ["Meeting Room", "Private Office Room", "Desk"],
        default: "Meeting Room"
    },

    // Area of the property in square units
    area: {
        type: Number,
        required: true
    },

    // Tags associated with the property
    tags: {
        type: [String],
        required: false
    },

    // URLs of property images
    images: {
        type: [String]
    },
    
    // Indicates if the property has parking
    hasParking: {
        type: Boolean,
        required: true,
        default: false
    },

    // Indicates if the property is accessible
    isAccessible: {
        type: Boolean,
        required: true,
        default: false
    },

    // Indicates if the property is currently available
    isAvailable: {
        type: Boolean,
        required: true,
        default: false
    },

    // Price of the property
    price: {
        type: Number,
        required: true
    },

    // Capacity of the property (number of people it can accommodate)
    capacity: {
        type: Number,
        required: true
    },

    // Lease term options for the property
    leaseTerm: {
        type: String,
        required: true,
        enum: ["Hourly", "Daily", "Weekly", "Monthly", "Yearly"],
        default: "Hourly"
    }

}, {timestamps: true});

// Create the Property model
const PropertyModel = mongoose.models.properties || mongoose.model("Property", PropertySchema);

export default PropertyModel;