import slugify from "slugify";
import productModel from "../models/productModel.js";
import categoryModel from '../models/categoryModel.js';
import orderModel from "../models/orderModel.js";
import fs from 'fs';
import braintree from "braintree";
import dotenv from 'dotenv';

dotenv.config();


//creating payment gateway
var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY
  });

export const createProductController=async(req,res)=>{
    try{
        const {name,slug,desc,price,category,quantity,shipping} = req.fields;
        const {photo} =req.files;

        //checking validity of req
        switch(true){
            case !name:
                return res.status(500).send({error:'Name is required'});
            case !desc:
                return res.status(500).send({error:'Description is required'});
            case !price:
                return res.status(500).send({error:'Price is required'});
            case !category:
                return res.status(500).send({error:'Category is required'});
            case !quantity:
                return res.status(500).send({error:'Quantity is required'});
            case photo&&photo.size>1000000:
                return res.status(500).send({error:'Photo is required and size should be less than 1mb'});
        }
        const products = new productModel({...req.fields,slug:slugify(name)});
        if(photo){
            products.photo.data=fs.readFileSync(photo.path);
            products.photo.contentType=photo.type;
        }

        await products.save();
        res.status(201).send({
            success:true,
            message:'Product created successfully',
            products
        });
    }
    catch(err){
        // console.log(err);
        res.staus(500).send({
            success:false,
            err,
            message:'Error in creating product'
        });
    }
};

//get all products
export const getProductController=async(req,res)=>{
    try{
        const products = await productModel.find({}).populate('category').select("-photo").limit(12).sort({createdAt:-1});
        res.status(200).send({
            success:true,
            totalCount:products.length,
            message:'All products',
            products,
        });
    }
    catch(err){
        // console.log(err);
        res.status(500).send({
            success:false,
            message:'An error occurred while accessing all products',
            error:err.message
        });
    }
};

//get single product
export const getSingleProductController=async(req,res)=>{
    try{
        const product = await productModel.findOne({slug:req.params.slug}).select("-photo").populate('category');
        res.status(200).send({
            success:true,
            message:'Desired product fetched successfully',
            product
        })
    }
    catch(err){
        // console.log(err);
        res.status(500).send({
            success:false,
            message:'Error while fetching desired product',
            error:err.message
        })
    }
};

//get single photo
export const productPhotoController=async(req,res)=>{
    try{
        const product = await productModel.findById(req.params.pid).select("photo");
        if(product.photo.data){
            res.set('Content-type',product.photo.contentType);
            return res.status(200).send(product.photo.data);
        }
    }
    catch(err){
        // console.log(err);
        res.status(500).send({
            success:false,
            message:'Could not fetch the desired product photo',
            err
        });
    }
};

//delete single product
export const deleteProductController=async(req,res)=>{
    try{
        await productModel.findByIdAndDelete(req.params.pid).select("-photo");
        res.status(200).send({
            success:true,
            message:'Product deleted successfully'
        })
    }
    catch(err){
        // console.log(err);
        res.status(500).send({
            success:false,
            message:'Error! Could not delete given product',
            err
        })
    }
};

//update a given product - UPDATE
export const updateProductController=async(req,res)=>{
    try{
        const {name,slug,desc,price,category,quantity,shipping} = req.fields;
        const {photo} =req.files;

        //checking validity of req
        switch(true){
            case !name:
                return res.status(500).send({error:'Name is required'});
            case !desc:
                return res.status(500).send({error:'Description is required'});
            case !price:
                return res.status(500).send({error:'Price is required'});
            case !category:
                return res.status(500).send({error:'Category is required'});
            case !quantity:
                return res.status(500).send({error:'Quantity is required'});
            case photo&&photo.size>1000000:
                return res.status(500).send({error:'Photo is required and size should be less than 1mb'});
        }
        const products = await productModel.findByIdAndUpdate(req.params.pid,{
            ...req.fields, slug:slugify(name)
        },{new:true});
        if(photo){
            products.photo.data=fs.readFileSync(photo.path);
            products.photo.contentType=photo.type;
        }

        await products.save();
        res.status(201).send({
            success:true,
            message:'Product updated successfully',
            products
        });
    }
    catch(err){
        // console.log(err);
        res.status(500).send({
            success:false,
            err,
            message:'Error in updating product'
        });
    }
};

export const productFiltersController=async(req,res)=>{
    try{
        //getting checkbox and radio
        const {checked,radio} = req.body;
        let args={}
        if(checked.length>0) args.category=checked;  //length is done to confirm whether checked is checked or not
        if(radio.length) args.price = {$gte: radio[0], $lte: radio[1]};
        const products=await productModel.find(args);
        res.status(200).send({
            success:true,
            products
        });
    }
    catch(err){
        // console.log(err);
        res.status(400).send({
            success:false,
            message:'Could not filter products',
            err
        });
    }
};

//counting no of products
export const productCountController=async(req,res)=>{
    try{
      const totalct = await productModel.find({}).estimatedDocumentCount();
      res.status(200).send({
        success:true,
        totalct
      });  
    }
    catch(err){
        // console.log(err);
        res.status(400).send({
            message:'Error in getting product count',
            success:false,
            err
        });
    }
};

//getting product list based on page
export const productListController=async(req,res)=>{
    try{
        const perPage=3;  //no of products on the page
        const page=req.params.page?req.params.page:1;
        const products = await productModel.find({})  //pagenation is being done here
        .select("-photo").skip((page-1)*perPage)
        .limit(perPage).sort({createdAt:-1});
        res.status(200).send({
            success:true,
            products
        })
    }
    catch(err){
        console.log(err);
        res.status(400).send({
            success:false,
            message:'There was an error to get the product list of given page'
        });
    }
};

//searching product
export const searchProductController=async(req,res)=>{
    try{
        const {keyword}=req.params;
        const results=await productModel.find({
            $or:[
                {name:{$regex: keyword,$options: "i"}},  //case insensitive options:i
                {desc:{$regex: keyword,$options: "i"}}  //case insensitive options:i
            ]
        }).select("-photo");
        res.json(results);
    }
    catch(err){
        // console.log(err);
        res.status(400).send({
            success:false,
            message:'Oops! Search mechanism crashed',
            err
        });
    }
};

//accessing related products
export const searchRelatedController=async(req,res)=>{
    try{
        const {pid,cid} = req.params;  //pid:product ID,cid: category ID
        const products = await productModel.find({
            category:cid,
            _id:{$ne:pid}  //$ne means not include
        }).select("-photo").limit(3).populate('category');
        res.status(200).send({
            success:true,
            products
        });
    }
    catch(err){
        // console.log(err);
        res.status(500).send({
            success:false,
            message:'There was an error accessing related products',
            err
        });
    }
};

//getting product by category
export const productCategoryController=async(req,res)=>{
    try{
        const category=await categoryModel.findOne({slug:req.params.slug});
        const products=await productModel.find({category}).populate('category');
        res.status(200).send({
            success:true,
            category,
            products
        });
    }
    catch(err){
        // console.log(err);
        res.status(400).send({
            success:false,
            message:'There was an error searching products with chosen category',
            err
        });
    }
};

//payment gateway API
//for token  a bit complex because it is 3rd party
export const braintreeTokenController=async(req,res)=>{
    try {
        gateway.clientToken.generate({},function(err,response){
            if(err){
                res.status(500).send(err);
            }
            else{
                res.send(response);
            }
        });
    } catch (err) {
        // console.log(err);
    }
};
//for payment
export const braintreePaymentController=async(req,res)=>{
    try {
        const {cart,nonce} = req.body;
        let total=0;
        cart.map((i)=>{total+=i.price});
        let newTransaction=gateway.transaction.sale({
            amount:total,
            paymentMethodNonce:nonce,
            options:{
                submitForSettlement:true,
            }
        },
        function(err,result){
            if(result){
                const order = new orderModel({
                   products:cart,
                   payment:result,
                   buyer:req.user._id 
                }).save();
                res.json({ok:true});
            }
            else{
                res.status(500).send(err);
            }
        }
        );
    } catch (err) {
        // console.log(err);
    }
};
