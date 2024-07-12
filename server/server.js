import { v2 } from 'cloudinary';
import cloudinary from "cloudinary";
import app from './app.js';
import connectionToDB from './config/dbConnection.js';
import Razorpay from 'razorpay';

import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Cloudinary configuration
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
    plan_id: process.env.RAZORPAY_PLAN_ID
  });

  console.log('Razorpay Config:', {
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET ? '****' : undefined,
  });
  
app.listen(PORT , async() => {
    await connectionToDB();
    console.log(`App is running at http:localhost:${PORT}`);
});



