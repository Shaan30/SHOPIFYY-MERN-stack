import express from "express";
import { isAdmin, requireSignIn } from './../middlewares/authMiddleware.js';
import { braintreePaymentController, braintreeTokenController, createProductController, deleteProductController, getProductController, getSingleProductController, productCategoryController, productCountController, productFiltersController, productListController, productPhotoController, searchProductController, searchRelatedController, updateProductController } from "../controllers/productController.js";
import formidable from 'express-formidable';

const router = express.Router();

//routes
router.post('/create-product',requireSignIn,isAdmin,formidable(), createProductController);
router.put('/update-product/:pid',requireSignIn,isAdmin,formidable(), updateProductController);

//get all products||method:get
router.get('/get-product', getProductController);

//get single product||method:get
router.get('/get-product/:slug', getSingleProductController);

//get photo||method:get
router.get('/product-photo/:pid',productPhotoController);

//delete a product||method:delete
router.delete('/delete-product/:pid',deleteProductController);

//filter a product||method:post
router.post('/product-filters',productFiltersController);

//count number of products||method:get
router.get('/product-count',productCountController);

//count number of products per page||method:get
router.get('/product-list/:page',productListController);

//search product||method:get
router.get('/search/:keyword',searchProductController);

//accessing similar products||method:get
router.get('/related-product/:pid/:cid',searchRelatedController);

//getting category wise product||method:get
router.get('/product-category/:slug',productCategoryController);

//payment route
//token
router.get('/braintree/token',braintreeTokenController);
//payments
router.post('/braintree/payment',requireSignIn,braintreePaymentController);

export default router;