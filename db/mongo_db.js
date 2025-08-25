const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoURI = process.env.MONGO_URI;

const connectToMongoDB = async () => {
    if (!mongoURI) {
        throw new Error('MongoURI is not defined properly in .env file');
    }

    try {
        const conection = await mongoose.connect(mongoURI)
        console.log(`MongoDB connected: ${conection.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit the app if DB connection fails
    }
}

module.exports = connectToMongoDB;