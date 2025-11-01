import { v2 } from 'cloudinary';
import cloudinary from "cloudinary";
import app from './app.js';
import connectionToDB from './config/dbConnection.js';
// Razorpay commented out for hosting deployment
// import Razorpay from 'razorpay';

import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Cloudinary configuration
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Razorpay code commented out for hosting deployment
  // Uncomment and configure when ready to use payment functionality
  /*
  // Validate Razorpay environment variables before initialization
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
    console.error('❌ Razorpay configuration error:');
    console.error('Missing required environment variables:');
    if (!process.env.RAZORPAY_KEY_ID) {
      console.error('  - RAZORPAY_KEY_ID is not set');
    }
    if (!process.env.RAZORPAY_SECRET) {
      console.error('  - RAZORPAY_SECRET is not set');
    }
    console.error('Please ensure these environment variables are set in your .env file or environment configuration.');
    throw new Error('Razorpay configuration is incomplete. Please set RAZORPAY_KEY_ID and RAZORPAY_SECRET environment variables.');
  }

  export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
    plan_id: process.env.RAZORPAY_PLAN_ID
  });

  console.log('✅ Razorpay initialized successfully');
  console.log('Razorpay Config:', {
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET ? '****' : undefined,
    plan_id: process.env.RAZORPAY_PLAN_ID || 'Not set',
  });
  */

  // Stub export for Razorpay to prevent errors in payment controller
  // Replace this with actual Razorpay initialization when ready
  export const razorpay = null;
  
app.listen(PORT , async() => {
    await connectionToDB();
    console.log(`App is running at http:localhost:${PORT}`);
});



