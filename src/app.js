import express from 'express';


// for cross origin resource shearing
import cors from "cors"
// exp packeg for henddling cookies
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
  origin:[ "http://localhost:5173", "https://my-tube-rho-two.vercel.app/" ], // your frontend URL
  credentials: true               // allow cookies/auth headers
}));


// kam itne me hi chal jata he 
// app.use(cors())

// configure cors
// app.use(cors({
//   // cors_origin = *   ==> which meance accept all riquest
//   origin: "*",
//   credentials: true
// }))

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
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js';
import commentRouter from './routes/comment.route.js';
import likeRouter from "./routes/like.routes.js";
import subscribeRouter from './routes/subscription.routes.js';
// 

app.use("/api/v1/users", userRouter);

app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/toggelLike" , likeRouter);
app.use("/api/v1/subscribe" , subscribeRouter);



export default app;