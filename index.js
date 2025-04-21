import { app } from "./src/app.js";
import dbConnect from "./src/db/index.js";
import "dotenv/config"; // Load environment variables

const PORT = process.env.PORT || 8080; // Set port from environment or default to 8080

dbConnect().then(() => {
   // Start the server after successful database connection
   app.listen(PORT, () => {
    console.log(`Server is listening to port: ${PORT}`)
   })
}).catch(error => console.log("MongoDB connection failed", error)); // Log error if database connection fails