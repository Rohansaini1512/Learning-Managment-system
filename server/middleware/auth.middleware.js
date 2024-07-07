import AppError from "../utils/error.utils.js";
import jwt from 'jsonwebtoken';


const isLoggedIn = (req,res,next) => {
    try{
        const { token } = req.cookies;

        if(!token){
            return next(new AppError('Unauthenicated , please login again' , 401))
        }
        
        // console.log(token);
        // console.log("Rohan");
        const userDetails = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = userDetails;

        next();
        
    }catch(e){
        return next(
            new AppError(e.message , 505)
        )
    }
}

const authorizedRoles = (...roles) => async(req,res,next)=>{
    const currentUserRoles = req.user.roles;
    if(roles.includes(currentUserRoles)){
        return next(
            new AppError('You do not have permission to access this route' , 403)
        )
    }

    next();
}

 const authorizeSubscriber = async(req, res, next) => {
    const subscription = req.user.subscription;
    const currentUserRole = req.user.role;

    if(currentUserRole !== 'ADMIN' && subscription.status !== 'active'){
        return next(
            new AppError('Please subscribe to access this route!' , 403)
        )
    }
    next();
 }

export{
    isLoggedIn,
    authorizedRoles,
    authorizeSubscriber
}