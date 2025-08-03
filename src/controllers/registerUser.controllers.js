import { asyncHandler } from "../utils/asyncHandler.js"
import { APIerror } from "../utils/APIerror.js"
import { User } from '../models/user.models.js';
import { uplodeFileOnCloudinary } from "../utils/cloudinary.js"
import { APIresponse } from "../utils/APIresponse.js";
import { jwt } from "jsonwebtoken";


const genrateAccessTokenAndRefreshToken = async (id) => {

  try {

    const user = await User.findById(id);
  
     const refreshToken = await user.genrateRefreshToken();
     const accessToken = await user.genrateAssessToken();
  
      user.refreshToken = refreshToken;
      await user.save({validateBeforeSave: false});

      return {refreshToken , accessToken}
    
  } catch (error) {
    throw new APIerror(500,  "somthing wnt wrong login failed")
  }


}

const registerUser = asyncHandler(async (req, res) => {

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


  const { userName, email, fullName, password } = req.body

  if (
    [userName, email, fullName, password].some((fild) => fild?.trim() === "")
  ) {
    throw new APIerror(400, "all filds are required")
  }

  if (!email.includes('@', 1)) {
    throw new APIerror(400, "invalid email")
  }
  // console.log("userName : ", userName , " email : ",email)

  const usernameExsist = await User.find({ userName });
  const emailExsisit = await User.find({ email });
  // console.log("username and email varification",usernameExsist, emailExsisit);
  if (
    usernameExsist.length || emailExsisit.length
  ) {
    throw new APIerror(409, "user with this username or email allready exist");
  }

  let avaterLocalPath = "";
  let coverImageLocalPath = "";

  if(res.files &&  Array.isArray(res.files?.avatar) && res.files.avatar.length > 0){
    avaterLocalPath = res.files.avatar[0].path
  }
  if(res.files &&  Array.isArray(res.files?.coverImage) && res.files.coverImage.length > 0){
    coverImageLocalPath = res.files.coverImage[0].path
  }

  // if(!avaterLocalPath){
  //   throw new APIerror(400, "Avater is required");
  // }
  // console.log("req.files", req.files )
  // console.log(avaterLocalPath,coverImageLocalPath);


  const avatar = (avaterLocalPath) ? await uplodeFileOnCloudinary(avaterLocalPath) : "not uploded";
  const coverImage = (coverImageLocalPath) ? await uplodeFileOnCloudinary(coverImageLocalPath) : "not uploded";
  
  // console.log(avatar,coverImage)
  if (avaterLocalPath && !avatar) {
    throw new APIerror(500, "somthing went wrong in registring user : uplode file to cloudnery");
  }

  if (coverImageLocalPath && !coverImage) {
    throw new APIerror(500, "somthing went wrong in registring user : uplode file to cloudnery");

  }

  const user = await User.create({
    email,
    userName: userName.toLowerCase(),
    password,
    fullName,
    avatar: avatar?.url || "",
    coverImage: coverImage?.url || ""
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )


  if (!createdUser) {
    throw new APIerror(500, "somthing went wrong : creating user in DataBase");
  }

  return res.status(201).json(
    new APIresponse(200, createdUser, "user created sucessfully")
  )



})



const loginUser = asyncHandler(async (req, res) => {
  // user se email ya username lege 
  // password lege
  // check kare ge user exsist karta he ki nhi
  // password check kre ge
  // user ko token provide kre ge
  // user loging krava dege
  // jha bhi user ko authenticate karna hoge wha token se kar lege

    // console.log(req);
    const { username, email, password } = req.body
  // const {email, password } = req.body

  // const {username} = req.body.username || null;

  if(!username && !email){
    throw new APIerror(401, "username or email required");
  }

  if(email && !email.includes('@')){
    throw new APIerror(409, "enter a valid email");
  }


  const  user = await User.findOne({ email });


  if(!user){
    throw new APIerror(409, "User not found");
  }

  const varifiedUser = await user.isPasswordCorrect(password);

  if(!varifiedUser){
    throw new APIerror(400, "the password is incorrect");
  }
  const {accessToken, refreshToken} = await genrateAccessTokenAndRefreshToken(user._id);


  const logedInUser = await User.findById(user._id).select("-password -refreshToken");


  const optins = {
    httpOnly:true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, optins)
  .cookie("refreshToken", refreshToken, optins)
  .json(
    new APIresponse(
      200,
      {
        data: accessToken, refreshToken, logedInUser
      },
      "user login sucessfully"
    )
  )

})





const logoutUser = asyncHandler(async(req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
    {
      new: true
    }
  )


  const optins = {
    httpOnly: true,
    secure: true

  }

  return res
  .status(200)
  .clearCookie("accessToken", optins)
  .clearCookie("refreshToken", optins)
  .json(new APIresponse(200, {}, "user loged out sucessfully"))

})



const  refreshAccessToker = asyncHandler( async (req, res) => {
  const recivedRefreshToken = req.cookie.refreshToken || req.body.refreshToken;
  
  if(!recivedRefreshToken){
    throw new APIerror(409, "user is not unauthorised");
  }

  const decodedUser = jwt.verify(recivedRefreshToken, process.env.REFRESH_TOKEN_SECRET );

  if(!decodedUser){
    throw new APIerror(500, "unable to process refresh token ");
  }

  const user  = await User.findById(decodedUser._id);

  if(!user){
    throw new APIerror(407, "invalid refresh token")
  }

  if(recivedRefreshToken !== user.refreshToken){
    throw new APIerror(409, "token is sexpired user");
  }

  const {refreshToken , accessToken} = await genrateAccessTokenAndRefreshToken(user._id);

  const logedInUser = await User.findById(user._id).select("-password -refreshToken");

   const optins = {
    httpOnly:true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, optins)
  .cookie("refreshToken", refreshToken, optins)
  .json(
    new APIresponse(
      200,
      {
        data: accessToken, refreshToken, logedInUser
      },
      "user login sucessfully"
    )
  )

  // ager user ka token db ke token se match ho jai to 
  // decode refresh token 
  // get the user of thet id
  // match the user token wiht recived token
  // if same
    // genrate new access and refresh token 
    // update refresh tokken in db
    // set both in cookies at user end
    // login user
  // nhi to
    // send error msg 
})

export { registerUser, loginUser , logoutUser, refreshAccessToker}