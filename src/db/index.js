import mongoose from 'mongoose';
import { dbOptions } from '../constants.js'

export default async function dbConnect() {
    try {
        // Destructure database options from constants
        const { mongodb_uri, db_name } = dbOptions;
        
        // Attempt to connect to MongoDB
        await mongoose.connect(`${mongodb_uri}/${db_name}`, {});
        
        // Get the connection reference
        const connectionReference = mongoose.connection;
        
        // Log successful connection
        connectionReference.once('Connected', () => {
            console.log("MongoDB connected successfully");
        })
        
        // Handle connection errors
        connectionReference.on('error', (error) => {
            console.error("MongoDB connection failed", error);
            process.exit(1)
        })
    } catch (error) {
        // Handle any errors during the connection process
        console.error("MongoDB Connection failed", error);
        process.exit(1);
    }
}