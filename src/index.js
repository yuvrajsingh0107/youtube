// require('dotenv').config({path : './env'})

import express from "express";
import dotenv from "dotenv";

// configure dotenv path for usinf es6 syntext
dotenv.config({path : './.env'});


// for cross origin resource shearing
import cors from "cors"
// exp packeg for henddling cookies
import cookieParser from "cookie-parser";


import app from './app.js';
import connectDB from './db/index.js';

// kam itne me hi chal jata he 
// app.use(cors())


// configure cors
app.use(cors({
  // cors_origin = *   ==> which meance accept all riquest
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

// configure json to make exppress accept with json data of limit 16kb
app.use(express.json({limit : '16kb'}))
// configure url encoder
// this will encode url like spase is %20% in url 
app.use(express.urlencoded({extended: true, limit : '16kb'}))
// configure static files   
app.use(express.static('public'))
// configure cookies to purfon CURD opration on cookies in user browser from server
app.use(cookieParser())




// DB connect ka do
connectDB()
.then(() => {
  // app.on ak express event listner he is vale ne error listen kar rhe he
  app.on('error', (error) => {
    console.log(`error in connction surver to DB : ${error}`);
  })
  // ager DB connect ho jai to surver ko chalu kar do
  app.listen(process.env.PORT || 8000 , () => {
    console.log(`listnig on port : ${process.env.PORT}  vist => http://localhost:${process.env.PORT}`);
    
  })

})
.catch((err) => {
  // DB  connection me koi error ai to ya console kar do
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