import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

//CRUD Operations
//create controller - CREATE
export const createCategoryController= async(req,res)=>{
    try{
        const {name}=req.body;
        if(!name){
            return res.status(401).send({message:'Name is required'});
        }
        const existingCategory = await categoryModel.findOne({name});
        if(existingCategory){
            return res.status(200).send({
                success:true,
                message:'Category Already Exists'
            });
        }
        const category = await new categoryModel({name,slug:slugify(name)}).save()
        res.status(201).send({
            success:true,
            message:'New Category created',
            category
        });
    }
    catch(err){
        // console.log(err);
        res.status(500).send({
            success:false,
            err,
            message:'Error in category'
        });
    }
};

//update controller - UPDATE
export const updateCategoryController=async(req,res)=>{
    try{
        const {name}=req.body;
        const {id}=req.params;
        const category = await categoryModel.findByIdAndUpdate(id,{name,slug:slugify(name)},{new:true});
        res.status(200).send({
            success:true,
            message:'Category updated successfully',
            category
        })
    }
    catch(err){
        // console.log(err);
        res.status(500).send({
            success:false,
            err,
            message:'Error! Cannot update category'
        });
    }
};

//get all categories - READ
export const categoryController=async(req,res)=>{
    try{
        const category = await categoryModel.find({});
        res.status(200).send({
            success:true,
            message:'List of all categories',
            category
        });
    }
    catch(err){
        // console.log(err);
        res.status(500).send({
            success:false,
            err,
            message:'An error occured while accessing all categories'
        })
    }
};


//get single category - READ
export const singleCategoryController=async(req,res)=>{
    try{
        const category = await categoryModel.findOne({slug:req.params.slug});
        res.status(200).send({
            success:true,
            message:'This is a single category',
            category
        });
    }
    catch(err){
        // console.log(err);
        res.status(500).send({
            success:false,
            err,
            message:'An error occured while accessing a single category'
        })
    }
};

//delete a single category - DELETE
export const deleteCategoryController=async(req,res)=>{
    try{
        const {id}=req.params;
        await categoryModel.findByIdAndDelete(id);
        res.status(200).send({
            success:true,
            message:'Selected category was deleted successfully'
        });
    }
    catch(err){
        // console.log(err);
        res.status(500).send({
            success:false,
            message:'Oops! cannot delete the given file',
            err
        });
    }
};
