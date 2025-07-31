import express from 'express';


// for cross origin resource shearing
import cors from "cors"
// exp packeg for henddling cookies
import cookieParser from "cookie-parser";


const app = express();


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

// user routes
import userRouter from './routes/user.routs.js';

// 

app.use("/api/v1/users", userRouter);

export default app;