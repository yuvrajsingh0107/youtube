import jwt from "jsonwebtoken";
import { APIerror } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.models.js';

export const verifyJWT = asyncHandler(
  async (req, res, next) => {
    try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
      console.log("Token from cookies or header:", token);
      if (!token) {
        throw new APIerror(401, "unauthorize user");
      }
      console.log("JWT Token:", token);

      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      console.log("Decoded JWT Token:", decodedToken);
      const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
      
      if (!user) {
        throw new APIerror(500, "Invalid access token");
      }
      console.log("Authenticated User:", user);
      req.user = user;

      next();
    } catch (error) {
      throw new APIerror(401, error?.message || "Invalid access token")

    }
  }
)