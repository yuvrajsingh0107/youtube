import { asyncHandler } from "../utils/asyncHandler.js"
import { APIerror } from "../utils/APIerror.js"
import { User } from '../models/user.models.js';
import { deleteFileOnCloudniry, uplodeFileOnCloudinary } from "../utils/cloudinary.js"
import { APIresponse } from "../utils/APIresponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const genrateAccessTokenAndRefreshToken = async (id) => {

  try {

    const user = await User.findById(id);

    const refreshToken = await user.genrateRefreshToken();
    const accessToken = await user.genrateAssessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken }

  } catch (error) {
    throw new APIerror(500, "somthing wnt wrong login failed")
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

  if (req.files && Array.isArray(req.files?.avatar) && req.files.avatar.length > 0) {
    console.log(req.files.avatar)
    avaterLocalPath = req.files.avatar[0].path
  }
  if (req.files && Array.isArray(req.files?.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }
  // console.log(req.files)
  // console.log(req.files.avatar[0])
  // console.log(req.files.coverImage[0])

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

  const { userName, email, password } = req.body
  // console.log(userName, email)

  if (!userName && !email) {
    throw new APIerror(401, "username or email required");
  }

  if (email && !email.includes('@')) {
    throw new APIerror(409, "enter a valid email");
  }

  if (!password) {
    throw new APIerror(409, "passwor is require");
  }
  let user;
  if (email)
    user = await User.findOne({ email });
  else
    user = await User.findOne({ userName });


  if (!user) {
    throw new APIerror(409, "User not found");
  }

  const varifiedUser = await user.isPasswordCorrect(password);

  if (!varifiedUser) {
    throw new APIerror(400, "the password is incorrect");
  }
  const { accessToken, refreshToken } = await genrateAccessTokenAndRefreshToken(user._id);


  const logedInUser = await User.findById(user._id).select("-password -refreshToken");


  const optins = {
    httpOnly: true,
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





const logoutUser = asyncHandler(async (req, res) => {
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



const refreshAccessToker = asyncHandler(async (req, res) => {
  const recivedRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

  if (!recivedRefreshToken) {
    throw new APIerror(409, "user is not unauthorised");
  }

  const decodedUser = jwt.verify(recivedRefreshToken, process.env.REFRESH_TOKEN_SECRET);

  if (!decodedUser) {
    throw new APIerror(500, "unable to process refresh token ");
  }

  const user = await User.findById(decodedUser._id);

  if (!user) {
    throw new APIerror(407, "invalid refresh token")
  }

  if (recivedRefreshToken !== user.refreshToken) {
    throw new APIerror(409, "token is sexpired user");
  }

  const { refreshToken, accessToken } = await genrateAccessTokenAndRefreshToken(user._id);

  const logedInUser = await User.findById(user._id).select("-password -refreshToken");

  const optins = {
    httpOnly: true,
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



const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new APIerror(409, "both fildes are requrired");
  }

  const user_id = req.user?._id;

  const user = await User.findById(user_id);


  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new APIerror(405, "unauthorized user ");
  }


  user.password = newPassword;
  user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new APIresponse(200, {}, "password change sucessfully")
    )

})


const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new APIresponse(200, req.user, "user fatch sucessfully"));

})

const updateAvatar = asyncHandler(async (req, res) => {
  const usr_id = req.user?._id;

  if (!usr_id) {
    throw new APIerror(400, "aunouthorized user");
  }

  let localfilePath;

  if (req.files && Array.isArray(req.files?.avatar) && req.files.avatar.length > 0) {
    localfilePath = req.files.avatar[0].path
  }

  if (!localfilePath) {
    throw new APIerror(400, "avtar not found")
  }
  const avatar = await uplodeFileOnCloudinary(localfilePath);

  const oldFilePath = req.user.avatar;
  console.log("avatar url : ", avatar.url);

  if (oldFilePath) {
    console.log("old file path", oldFilePath);
    deleteFileOnCloudniry(oldFilePath);
  }
  const user = await User.findByIdAndUpdate(
    usr_id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    { new: true }
  )
    .select("-password -refreshToken -watchHistory");

  return res
    .status(200)
    .json(
      new APIresponse(200, user, "avatar updated sucessfully")
    )

})


const updateCoverImage = asyncHandler(async (req, res) => {
  const usr_id = req.user?._id;

  if (!usr_id) {
    throw new APIerror(400, "aunouthorized user");
  }

  let localfilePath;

  if (req.files && Array.isArray(req.files?.coverImage) && req.files.coverImage.length > 0) {
    localfilePath = req.files.coverImage[0].path
  }

  if (!localfilePath) {
    throw new APIerror(400, "covrImage not found")
  }
  const coverImage = await uplodeFileOnCloudinary(localfilePath);


  const oldFilePath = req.user.coverImage;

  if (oldFilePath) {
    console.log("old file path", oldFilePath);
    deleteFileOnCloudniry(oldFilePath);
  }

  const user = await User.findByIdAndUpdate(
    usr_id,
    {
      $set: {
        avatar: coverImage.url
      }
    },
    {
      new: true
    }
  )
    .select("-password -refreshToken -watchHistory");

  return res
    .status(200)
    .json(
      new APIresponse(200, user, "coverimage updated sucessfully")
    )

})


const updateFullName = asyncHandler(async (req, res) => {
  const user_id = req.user?._id
  const fullName = req.body?.fullName;

  console.log("req ki body : ", req.body);

  if (!user_id) {
    throw new APIerror(404, "user not found");
  }
  if (!fullName) {
    throw new APIerror(409, "full name is riquired");
  }

  const user = await User.findByIdAndUpdate(
    user_id,
    {
      $set: {
        fullName
      }
    },
    { new: true }
  )
    .select("-password -refreshToken -watchHistory");

  return res.status(200)
    .json(
      new APIresponse(200, user, "fullname updated sucess fully")
    )
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params?.userName;
  if (!userName) {
    throw new APIerror(404, "channel name is required");
  }


  // aggregate ak method he jisne nested quries likh sakte he first quri ak result dusri quri me pass hot HE 

  const channel = await User.aggregate([
    {
      $match: {
        userName: userName.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        as: "subscribers",
        localField: "_id",
        foreignField: "channel"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        as: "suscribedChannel",
        localField: "_id",
        foreignField: "subscriber"
      }
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscriber"
        },
        subscribedChannelCount: {
          $size: "$suscribedChannel"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscrider"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        userName,
        email,
        fullName,
        avatar,
        coverImage,
        isSubscribed,
        subscribedChannelCount,
        subscriberCount
      }
    }
  ])

  if (!channel.length) {
    throw new APIerror(404, "channel not fount");
  }

  return res
    .status(200)
    .json(
      new APIresponse(200, channel[0], "channel fatched successfully")
    )
})


const getUserWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const user_id = mongoose.Types.ObjectId(userId);
  const user = User.aggregate([
    {
      $match: {
        _id: user_id
      },
    }, {
      $lookup: {
        from: "videos",
        as: "watchHistory",
        localField: "watchHistory",
        foreignField: "_id",
        pipeline: [
          {
            $lookup: {
              from: "users",
              as: "owner",
              foreignField: "_id",
              localField: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    avatar: 1,
                    userName: 1
                  }
                }
              ]
            },
            $addFields: {
              owner:{
                $first: "$owner"
              }
            }
          }
        ]
      }
    }
  ])

  return res
  .status(200)
  .json(
    new APIresponse(200,user[0].watchHistory)
  )
})


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToker,
  changePassword,
  getCurrentUser,
  updateAvatar,
  updateCoverImage,
  updateFullName,
  getUserChannelProfile,
  getUserWatchHistory
}