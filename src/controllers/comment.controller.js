import { APIerror } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from '../models/comments.models.js';
import { APIresponse } from "../utils/APIresponse.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";


const addComment = asyncHandler( async (req, res) => {
  const videoId = req.body.videoId;
  const content = req.body.content;
  const userId = req.user?._id;
  if(!userId){
    throw new APIerror(409, " unquthorized riques tuser not login add comment")
  }
  console.log("video id : ", videoId)
  console.log("content : ", content)
  if(!videoId || !content){
    throw new APIerror(409, "missing information about comment");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId
  })

  return res
  .status(201)
  .json(
    new APIresponse(200 , comment , "comment created sucessfully")
  )
})

const deletCommet = asyncHandler( async (req, res) => {
  const commentId = new mongoose.Types.ObjectId(req.query?._id);
  if(!commentId){
    throw new APIerror(400, "comment id is missing")
  }

  const user = req.user?._id;


  const comment = await Comment.findById(commentId);
  if(!comment){
    throw new APIerror(404, " comment not found");
  }
  console.log("comment : ",comment)
  console.log("user : ", user)

  if(!comment.owner.equals(user)){
    throw new APIerror(409, "unauthorized user can not delete comment");
  }

  const responce  = await Comment.deleteOne({_id : comment._id})
  // console.log("responce : ",responce)
  if(responce.deletedCount !== 1){
    throw new APIerror(500 , "failed to delete comment");
  }

  return res
  .status(200)
  .json(
    new APIresponse(200,{}, "comment deleted sucessfully")
  )

})

export { addComment , deletCommet}