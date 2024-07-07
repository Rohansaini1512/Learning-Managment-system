import { Schema , model } from "mongoose";
import bcrypt from "bcrypt";
// const bcrypt = 
import jwt from "jsonwebtoken";
// import { JsonWebTokenError } from "jsonwebtoken";
import crypto from "crypto";


const userSchema = new Schema({
    fullName: {
        type: 'String',
        required: [true, 'Name is required'],
        minLength: [5, 'Name must be at least 5 charcter'],
        maxLength: [50, 'Name should be less than 50 char'],
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true , 'user email is required'],
        unique: true,
        lowercase: true,
        unique: [true , 'already registered']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [8, 'Password must be at least 8 char'],
        select: false
    },
    avatar: {
        public_id: {
            type: 'String'
        },
        secure_url:{
            type: 'String'
        }
    },
    role:{
        type: 'String',
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    forgotPasswordToken: {
        type: String,
    },
    
    forgotPasswordExpiryDate: {
        type: Date
    },
    subscription: {
        id: String,
        status: String
    }
    // password: {
    //     type: 'String'
    // },
},{
    timestamps: true
});

userSchema.pre('save' , async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
});

userSchema.methods = {
    generateJWTToken: async function () {
        return await jwt.sign(
        { id: this._id, email: this.email, role: this.role, subscription: this.subscription },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRY,
        }
        );
    },
    comparePassword: async function(plainTextPassword){
        return await bcrypt.compare(plainTextPassword, this.password)
    },
    generatePasswordResetToken: async function(){
        const resetToken = crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken= crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex')
            ;
        this.forgotPasswordExpiry = Date.now() + 15*60*1000; //15 min from now

        return resetToken;
    }
}

const User = model('User' , userSchema);

export default User;