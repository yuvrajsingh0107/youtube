import { asyncHandler } from "../utils/asyncHandler.js"
import { APIerror } from "../utils/APIerror.js"
import {User} from '../models/user.models.js';
import { uplodeFileOnCloudinary } from "../utils/cloudinary.js"
import { APIresponse } from "../utils/APIresponse.js";



// cridentials lena he user sa 
// validation for data
// check if allready exist
// check for images and avatar 
// uplode them to cloudinary
// chect if it is uploded successfully
// create user object - create entry in db
// remove password ans refress token from responce
// check for user creation
// return res




const registerUser = asyncHandler(async (req, res) => {

  const { userName, email, fullName, password } = req.body

  if (
    [userName, email, fullName, password].some((fild) => fild?.trim() === "")
  ) {
    throw new APIerror(400, "all filds are required")
  }

  if (!email.includes('@', 1) ) {
    throw new APIerror(400, "invalid email")
  }

  const usernameExsist = await User.find({ userName });
  const emailExsisit = await User.find({ email });
  // console.log(usernameExsist, emailExsisit);
  if (
      usernameExsist.length || emailExsisit.length
  ) {
    throw new APIerror(409, "user with this username or email allready exist");
  }

  const avaterLocalPath = req.files?.avatar[0].path;
  const coverImageLocalPath = req.files?.coverImage[0].path

  // if(!avaterLocalPath){
  //   throw new APIerror(400, "Avater is required");
  // }
  console.log("req.files", req.files )
  console.log(avaterLocalPath,coverImageLocalPath);


  const avatar = (avaterLocalPath)? await uplodeFileOnCloudinary(avaterLocalPath) : "fali"  ;
  const coverImage = (coverImageLocalPath)? await uplodeFileOnCloudinary(coverImageLocalPath) : "fali";
  
  console.log(avatar,coverImage)
  if(avaterLocalPath && !avatar){
    throw new APIerror(500, "somthing went wrong in registring user : uplode file to cloudnery");
  }

  if(coverImageLocalPath && !coverImage){
    throw new APIerror(500, "somthing went wrong in registring user : uplode file to cloudnery");

  }

  const user = await User.create({
    email,
    userName : userName.toLowerCase(),
    password,
    fullName,
    avatar: avatar?.url || "",
    coverImage: coverImage?.url || ""
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  

  if(!createdUser){
    throw new APIerror(500, "somthing went wrong : creating user in DataBase");
  }

  return res.status(201).json(
    new APIresponse(200, createdUser, "user created sucessfully")
  )



})

export { registerUser }