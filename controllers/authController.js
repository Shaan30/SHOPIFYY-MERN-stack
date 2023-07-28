import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import JWT from 'jsonwebtoken';

export const registerController = async (req,res) =>{
    try{
        const {name,email,password,phone,address,answer} = req.body;

        //checking validity
        if(!name){
            return res.send({message:'Name is Required'});
        }
        if(!email){
            return res.send({message:'Mail ID is Required'});
        }
        if(!phone){
            return res.send({message:'Phone Number is Required'});
        }
        if(!password){
            return res.send({message:'Password is Required'});
        }
        if(!address){
            return res.send({message:'Address is Required'});
        }
        if(!answer){
            return res.send({message:'Security Answer is Required'});
        }

        //checking the user
        const existingUser = await userModel.findOne({email});
        //if the user already is in the database(existing user)
        if(existingUser){
            return res.status(200).send({
                success:false,
                message:'Registered already, Please Login!'
            });
        }

        //registering the user
        const hashedPassword = await hashPassword(password);

        //saving the user
        const user = await new userModel({name,email,phone,address,password:hashedPassword,answer}).save();

        res.status(201).send({
            success:true,
            message:'User has been registered successfully!',
            user
        });
    }
    catch(err){
        // console.log(err);
        res.status(500).send({
            success:false,
            message:'Error in Registration Process',
            err
        })
    }
};

//LOGIN POST
export const loginController = async (req,res) => {
    try{
        const {email,password} = req.body;

        //checking validation
        if(!email||!password){
            return res.status(404).send({
                success:false,
                message:'Invalid mail ID or password'
            });
        };

        //checking user
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(404).send({
                success:false,
                message:'Email is not registered'
            });
        };

        const match = await comparePassword(password,user.password);
        if(!match){
            return res.status(200).send({
                success:false,
                message:'Invalid password entered'
            });
        };

        //creating token
        const token = await JWT.sign({_id:user._id},process.env.JWT_SECRET, {expiresIn:'7d'});
        res.status(200).send({
            success:true,
            message:'Congrats! Logged in successfully',
            user:{
                name:user.name,
                email:user.email,
                phone:user.phone,
                address:user.address,
                role:user.role
            },
            token,
        });
    }
    catch(err){
        // console.log(err);
        res.status(500).send({
            success:false,
            message:'Unfortunately cannot login due to some error :(',
            err
        });
    }
};

//Forgot Password Controller
export const forgotPasswordController=async(req,res)=>{
    try{
        const {email,answer,newPassword} = req.body;
        if(!email){
            res.status(400).send({
                message:'Email ID required'
            });
        }
        if(!answer){
            res.status(400).send({
                message:'Security answer required'
            });
        }
        if(!newPassword){
            res.status(400).send({
                message:'New password required'
            });
        }
        //check
        const user=await userModel.findOne({email,answer});
        //validation
        if(!user){
            return res.status(404).send({
                success:false,
                message:'User does not exist. Please check the given email ID and security answer'
            });
        }

        const hashed = await hashPassword(newPassword);
        await userModel.findByIdAndUpdate(user._id,{password:hashed});
        res.status(200).send({
            success:true,
            message:'Password reset successful'
        });
    }
    catch(err){
        // console.log(err);
        res.status(500).send({
            success:false,
            message:'Something went wrong',
            err
        });
    }
};

//Test Controller
export const testController=(req,res)=>{
    try{res.send('Route is protected');}
    catch(err){
        // console.log(err);
        res.send({err});
    }
};

//updating profile controller
export const updateProfileController=async(req,res)=>{
    try {
        const {name,password,address,phone}=req.body;
        const user = await userModel.findById(req.user._id);
        //checking password
        if(password&&password.length<8){
            return res.json({error:'Password is required and 8 characters long'});
        }

        //password hashing
        const hashedPassword=password?await hashPassword(password):undefined;

        const updatedUser=await userModel.findByIdAndUpdate(req.user._id,{
            name:name||user.name,
            password:hashedPassword||user.password,
            address:address||user.address,
            phone:phone||user.phone
        },{new:true});
        res.status(200).send({
            success:true,
            message:'Profile updated successfully',
            updatedUser
        })
    } catch (err) {
        // console.log(err);
        res.status(400).send({
            success:false,
            message:'There was an error in updating profile',
            err
        });
    };
}

export const getOrderController=async(req,res)=>{
    try {
        const orders=await orderModel.find({buyer:req.user._id}).populate('products','-photo').populate('buyer','name');
        res.json(orders);
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success:false,
            message:'There was an error viewing all orders',
            err
        });
    }
}

export const getAllOrderController=async(req,res)=>{
    try {
        const orders=await orderModel.find().populate('products','-photo').populate('buyer','name').
        sort({createdAt:'-1'});
        res.json(orders);
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success:false,
            message:'There was an error viewing all orders',
            err
        });
    }
};

export const updateStatusController=async(req,res)=>{
    try {
        const {orderId}=req.params;
        const {status}=req.body;
        const orders = await orderModel.findByIdAndUpdate(orderId,{
            status
        },{new:true});
        res.json(orders);
    } catch (err) {
        // console.log(err);
        res.status(500).send({
            success:false,
            message:'ERROR, could not update the status of order',
            err
        });
    }
}