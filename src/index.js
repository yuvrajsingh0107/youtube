// require('dotenv').config({path : './env'})

import dotenv from "dotenv";
dotenv.config({path : './.env'});

import cors from "cors"
import cookieParser from "cookie-parser";


import app from './app.js';
import connectDB from './db/index.js';


// configure cors
app.use(cors({
  origin: process.env.CORS_ORIGIN
}))

// configure json
app.use(express.json({limit : '16kb'}))
// configure url encoder
app.use(express.urlencoded({extended: true, limit : '16kb'}))
// configure static files 
app.use(express.static('public'))
// configure cookies
app.use(express.cookieParser())





connectDB()
.then(() => {
  app.on('error', (error) => {
    console.log(`error in connction surver to DB : ${error}`);
  })

  app.listen(process.env.PORT || 8000 , () => {
    console.log(`listnig on port : ${process.env.PORT}  vist => http://localhost:${process.env.PORT}`);
    
  })

})
.catch((err) => {
  console.log("unable to connect to db")
  throw err
})









/*
import express from 'express';
const app = express();

;( async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on('error', (error) => {
      console.log("ERROR: in connecting surver to db ", error);
      throw error
    })

    app.listen(process.env.PORT, () => {
      console.log('app is listning on the port : ', process.env.PORT);
    })
  } catch (error) {
    console.log(`ERROR: error in DB connection : ${error}`);
    throw error
    
  }
})()

*/