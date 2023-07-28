import express from "express";
import {forgotPasswordController, getAllOrderController, getOrderController, registerController, updateProfileController, updateStatusController} from '../controllers/authController.js';
import { loginController } from "../controllers/authController.js";
import { testController } from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";


//router object
const router = express.Router();


//routing

//Register||Method:post
router.post('/register',registerController);

//Login||Method:post
router.post('/login',loginController);

//Forgot Password||Method:post
router.post('/forgot-password', forgotPasswordController);

//Test||Method:get
router.get('/test', requireSignIn, isAdmin, testController);

//Protected user-route auth||Method:get
router.get('/user-auth',requireSignIn, (req,res)=>{
    res.status(200).send({
        ok:true
    });
});

//Protected admin-route auth||Method:get
router.get('/admin-auth',requireSignIn,isAdmin,(req,res)=>{
    res.status(200).send({
        ok:true
    });
});

//update profile||method:put(update)
router.put('/profile',requireSignIn, updateProfileController);

//getting orders||method:get
router.get('/orders',requireSignIn,getOrderController);

//getting all orders||method:get
router.get('/all-orders',requireSignIn,isAdmin,getAllOrderController);

//order status update||method:put
router.put('/order-status/:orderId',requireSignIn,isAdmin,updateStatusController);

export default router;