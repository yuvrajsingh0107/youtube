import jwt from "jsonwebtoken";
import { APIerror } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.models.js';
import { APIresponse } from "../utils/APIresponse.js";

export const verifyJWT = asyncHandler(
  async (req, res, next) => {
    console.log("in verifyJWT middleware")
    try {
      const accessToken =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
      if (!accessToken) {
        throw new APIerror(401, "Token not found");
      }

      const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(decodedToken?._id).select("-password ");
      
      if (!user) {
        throw new APIerror(500, "Invalid access token user not found");
      }
      req.user = user;
      console.log("USER AUTHENTICATED SUCCESSFULLY")
      next();
    } catch (error) {
      console.log(error.message)
      if(error.message == "jwt expired"){
        console.log("sending failer responce");
        return new APIresponse(401, {}, "access token expired");
      }
      throw new APIerror(401, error?.message || "Invalid access token")
    }
  }
)