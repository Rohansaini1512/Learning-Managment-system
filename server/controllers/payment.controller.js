import User from "../models/user.model.js";
import { razorpay } from "../server.js";
import AppError from "../utils/error.utils.js";
import dotenv from 'dotenv';

dotenv.config();

export const getRazorpayApiKey = async (req,res,next) => {
    res.status(200).json({
        success: true,
        message: 'Razorpay API Key',
        key: process.env.RAZORPAY_KEY_ID
    });
}

export const buySubscription = async (req,res,next) => {
    try{
        // Check if Razorpay is configured
        if(!razorpay){
            return next(
                new AppError('Payment service is currently unavailable. Please contact support.', 503)
            )
        }

        const {id} = req.user;
    const user = await User.findById(id);

    if(!user){
        return next(
            new AppError('Unauthorized , please login again')
        )
    }

    if(user.role === 'ADMIN'){
        return next(
            new AppError(
                'ADMIN cannot purchase a subscription', 400
            )
        )
    }
    console.log("Hello");
    console.log(`Using Razorpay Plan ID: ${process.env.RAZORPAY_PLAN_ID}`);
    const subscription = await razorpay.subscriptions.create({
        plan_id: process.env.RAZORPAY_PLAN_ID,
        customer_notify: 1
    });

    console.log(`Subscription created: ${JSON.stringify(subscription)}`);

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Subscribed Successfully',
        subscription_id: subscription.id
    });
    }catch(e){
        return next(
            new AppError(e.message , 500)
        )
    }
    
}

export const verifySubscription = async (req,res,next) => {
    try{
        const {id} = req.user;
    const {razorpay_payment_id, razorpay_signature, razorpay_subscription_id} = req.body;
    const user = await User.findById(id);

    if(!user){
        return next(
            new AppError('Unauthorized , please login again')
        )
    }

    const subscriptionId = user.subscription.id;

    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET)
        .update(`${razorpay_payment_id} | ${subscriptionId}`)
        .digest('hex');

    if(generatedSignature !== razorpay_signature){
        return next(
            new AppError('Payment not verified , please try again' , 500)
        )
    }

    await PaymentMethodChangeEvent.create({
        razorpay_payment_id,
        razorpay_signature,
        razorpay_subscription_id,
    });

    user.subscription.status = 'active';
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Payment verified successfully!'
    })
    }catch(e){
        return next(
            new AppError(e.message , 500)
        )
    }
    
}

export const cancelSubscription = async (req,res,next) => {
    try{
        // Check if Razorpay is configured
        if(!razorpay){
            return next(
                new AppError('Payment service is currently unavailable. Please contact support.', 503)
            )
        }

        const {id} = req.user;
    const user = await User.findById(id);

    if(!user){
        return next(
            new AppError('Unauthorized , please login again')
        )
    }
    if(user.role === 'ADMIN'){
        return next(
            new AppError(
                'ADMIN cannot purchase a subscription', 400
            )
        )
    }

    const subscriptionId = user.subscription.id;

    const subscription = await razorpay.subscriptions.cancel(
        subscriptionId
    )

    user.subscription.status = subscription.status;

    await user.save();

    }catch(e){
        return next(
            new AppError(e.message , 500)
        )
    }   
}

export const allPayment = async (req,res,next) => {
    try{
        // Check if Razorpay is configured
        if(!razorpay){
            return next(
                new AppError('Payment service is currently unavailable. Please contact support.', 503)
            )
        }

        const { count } = req.query;

    const subscriptions = await razorpay.subscriptions.all({
        count: count || 10,
    });

    res.status(200).json({
        success: true,
        message: 'All payments',
        subscriptions,
    })
    }catch(e){
        return next(
            new AppError(e.message , 500)
        )
    }
    

};