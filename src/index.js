// require('dotenv').config({path : './env'})

import dotenv from "dotenv";

// configure dotenv path for usinf es6 syntext
dotenv.config({path : './.env'});


import app from './app.js';
import connectDB from './db/index.js';




// DB connect ka do
connectDB()
.then(() => {
  // app.on ak express event listner he is vale ne error listen kar rhe he
  app.on('error', (error) => {
    console.log(`error in connction surver to DB : ${error}`);
  })
  // ager DB connect ho jai to surver ko chalu kar do
  app.listen(process.env.PORT || 5000 , () => {
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