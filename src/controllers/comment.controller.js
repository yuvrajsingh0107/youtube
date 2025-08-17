import { APIerror } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from '../models/comments.models.js';
import { APIresponse } from "../utils/APIresponse.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";


const getAllcomments = asyncHandler( async (req, res) => {
  console.log("in get all comments ")
  
  const videoId = new mongoose.Types.ObjectId(req.params?.videoId);
  const page = req.params?.page || 1;
  if(!videoId){
    throw new APIerror(400, "video id is missing");
  }

  console.log("video  id : ", videoId)
  const skip = (page - 1) * 10;

  const comments = await Comment.aggregate([
    {
      $match: {
        video: videoId
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $skip: skip
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "owner",
        as: "owner",
        pipeline: [{
          $project: {
            _id: 1,
            fullName: 1,
            avatar: 1,
            userName: 1
          }
        }]
      }
    },
    {
      $project: {
        createdAt: 1,
        _id: 1,
        content: 1,
        video: 1,
        owner: {
          $arrayElemAt: ["$owner", 0]
        }
      }
    }
    
  ])

  console.log("comments at backend : ", comments)

  return res
  .status(200)
  .json(
    new APIresponse(200, comments, "comments fetch sucessfully")
  )
})


const addComment = asyncHandler( async (req, res) => {
  const videoId = req.body.videoId;
  const content = req.body.content;
  const userId = req.user?._id;
  if(!userId){
    throw new APIerror(409, " unquthorized riques tuser not login add comment")
  } 
  // console.log("video id : ", videoId)
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
  const commentId = new mongoose.Types.ObjectId(req.params?._id);
  if(!commentId){
    throw new APIerror(400, "comment id is missing")
  }

  const user = req.user?._id;


  const comment = await Comment.findById(commentId);
  if(!comment){
    throw new APIerror(404, " comment not found");
  }
  // console.log("comment : ",comment)
  // console.log("user : ", user)

  if(!comment.owner.equals(user)){
    throw new APIerror(409, "unauthorized user can not delete comment");
  }

  const responce  = await Comment.deleteOne({_id : comment._id})
  // console.log("responce : ",responce)
  console.log("comment deleted successfully")
  if(responce.deletedCount !== 1){
    throw new APIerror(500 , "failed to delete comment");
  }

  return res
  .status(200)
  .json(
    new APIresponse(200,{}, "comment deleted sucessfully")
  )

})

// update comment
const updateComment = asyncHandler( async (req, res) => {

  const commentId = req.params?.commentId;
  if(!commentId){
    throw new APIerror(409, " comment is missing");
  }
  const commet_id = new mongoose.Types.ObjectId(commentId);

  const userID = req.user?._id;

  if(!userID){
    throw new APIerror(409, "user id is missing");
  }

  const user_id = new mongoose.Types.ObjectId(userID);

  const content = req.body?.content;

  if(!content){
    throw new APIerror(405, " content filed is riquire");
  }
  
  const comment = await Comment.findById(commet_id);
  // console.log("comment : ",comment)

  if(comment.owner.equals(user_id)){
    const updatedcomment = await Comment.findByIdAndUpdate(commet_id,{content});
    console.log("comment updated successfully")
    return res
    .status(200)
    .json(
      new APIresponse(200, updatedcomment, "comment updated sucessfully")
    )
  }else{
    throw new APIerror(412, "unauthorized riquest user is not owner of comment")
  }

})

export {getAllcomments, addComment , deletCommet , updateComment}
// get all comments on a video 