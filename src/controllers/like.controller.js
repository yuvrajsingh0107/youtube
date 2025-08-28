import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIerror } from "../utils/APIerror.js";
import { Like } from "../models/likes.models.js";
import { APIresponse } from "../utils/APIresponse.js";


const toggelVideoLike = asyncHandler( async (req, res) => {
  // kisne kiya  *
  const user_id = new mongoose.Types.ObjectId(req.user?._id);
  if(!user_id){
    throw new APIerror(409, "user Not login an authorized riquest");
  }

  const video_id = new mongoose.Types.ObjectId(req.params?.video);
  // kon se pe kiya 

  if(!video_id){
    throw new APIerror(404, "video not found");
  }

  const like = await Like.findOne({video : video_id, likedBy: user_id});


  let deletedLike ;
  if(like?.likedBy.equals(user_id)){
    deletedLike = await Like.findByIdAndDelete(like._id);
    if( deletedLike){
    return res
    .status(200)
    .json(
      new APIresponse(200, {like : false} , "like removd sucessfully")
    )
  }else{
    return res
    .status(500)
    .json(
      new APIresponse(500, deletedLike , "faliled to remove like")
    )
  }

  }else{
    const createdLike = await Like.create({
      video: video_id,
      likedBy: user_id
    })
    
    if(!createdLike){
      throw new APIerror(500, "failed to like");
    }
    
    return res
    .status(200)
    .json(
      new APIresponse(200, {like : true}, "liked sucessfull")
    )
  }

})



const toggelCommentLike = asyncHandler( async (req, res) => {
  // kisne kiya  *
  const user_id = new mongoose.Types.ObjectId(req.user?._id);
  
  if(!user_id){
    throw new APIerror(409, "user Not login an authorized riquest");
  }

  
  const comment_id = new mongoose.Types.ObjectId(req.params?.comment);
  // kon se pe kiya 

  if(!comment_id){
    throw new APIerror(404, "comment not found");
  }

  const like = await Like.findOne({comment : comment_id, owner: user_id});


  let deletedComment ;

  if(like?.likedBy.equals(user_id)){
    deletedComment = await Like.findByIdAndDelete(like._id);
    if( deletedComment){
    return res
    .status(200)
    .json(
      new APIresponse(200, deletedComment , "like removd sucessfully")
    )
  }else{
    return res
    .status(500)
    .json(
      new APIresponse(500, deletedComment , "faliled to remove like")
    )
  }

  }else{
    const createdLike = await Like.create({
      comment: comment_id,
      likedBy: user_id
    })
    
    if(!createdLike){
      throw new APIerror(500, "failed to like");
    }
    
    return res
    .status(200)
    .json(
      new APIresponse(200, createdLike, "liked sucessfull")
    )
  }

})


// toggele tweet like

// get all liked videos


export {toggelVideoLike , toggelCommentLike} 