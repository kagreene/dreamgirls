import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

//get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dreamgirls_safety_db';

mongoose.connect(MONGODB_URI);

export default mongoose.connection;
