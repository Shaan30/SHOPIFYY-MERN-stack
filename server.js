import express from 'express';
import colors from 'colors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoute.js';
import categoryRoutes from './routes/categoryRoute.js';
import productRoutes from './routes/productRoute.js';
import cors from 'cors';
import {fileURLToPath} from 'url';
import path from 'path';

//configuring env
dotenv.config();

//connect database
connectDB();

//fixing es module
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

const app = express();  //rest object

//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname,'./client/build')));

//routes
app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/category',categoryRoutes);
app.use('/api/v1/product',productRoutes);

//rest api
app.use('*',function(req,res){
    res.sendFile(path.join(__dirname,'./client/build/index.html'));
});

//PORT
const PORT = process.env.PORT||8080;

//listen
app.listen(PORT,()=>{
    // console.log(`Server connected to port: ${PORT}`.bgCyan.white);
});
