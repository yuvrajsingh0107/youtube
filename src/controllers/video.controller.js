import { Video } from "../models/video.model.js"
import { Like } from "../models/likes.models.js";
import { Comment } from '../models/comments.models.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { APIerror } from '../utils/APIerror.js';
import { APIresponse } from '../utils/APIresponse.js';
// import cloudnery from '../utils/cloudinary.js';
import { deleteFileOnCloudniry, uplodeFileOnCloudinary } from '../utils/cloudinary.js';
import mongoose from "mongoose";
// import getVideoDurationInSeconds from "get-video-duration"
// import fs from "fs";


// panding he abhi aggrigation pipeline


// get video feed
const getFeed = asyncHandler(async (req, res) =>{ 
  const page = req.query?.page || 1;
  const sikpValue = (page - 1) * 6;
  // const videos = await Video.find({}).skip(sikpValue).limit(6);
  const videos = await Video.aggregate([
    {
      $skip: sikpValue,
    },
    {
      $limit: 6
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerInfo",
        pipeline: [{
          $project: {
            userName: 1,
            _id: 1,
            fullName: 1,
            email: 1,
            avatar: 1
          }
        }]
      }
    },
    {
      $project:{
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        ownerInfo: 1,
        owner: 1,
        createdAt: 1,
        duration: 1,
        views: 1,
        _id: 1
      }
    }
  ]
)
  console.log("videos : ", videos);
  return res
  .status(200)
  .json(
    new APIresponse(200, videos, "video feed fetched sucess fully")
  )
})


// get all videos based on querie
const getSearchResult = asyncHandler( async (req, res) => {
  // console.log(req.query.search);
  const query = req.query.search?.split(" ");
  if(!query){
    throw new APIerror(409, "search qury is messing ");
  }
  console.log("queris : ", query)

  const videos =await Video.aggregate([
    {
      $search: {
        text: {
          query: query,
          path: "title"
        }
      }
    },
    {
      $limit: 6
    },
  {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerInfo",
        pipeline: [{
          $project: {
            userName: 1,
          _id: 1,
          fullName: 1,
          email: 1,
          avatar: 1
          }
        }]
      }
    },

    {
      $project:{
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        ownerInfo: 1,
        owner: 1,

        duration: 1,
        views: 1
      }
    }

  ])


 
  return res
  .status(200)
  .json(
    new APIresponse(200, videos, "serach result fetched sucess fully")
)
})





const uplodeVideo = asyncHandler(async (req, res) => {

  const user = req.user;
  if (!user) {
    throw new APIerror(409, "unathorised request");
  }
  const { title, description } = req.body;
  if (!title || !description) {
    throw new APIerror(409, "Title and discriotion are riquired");
  }

  let videoLocalPath = "";
  let thumbnailLocalPath = "";
  if (req.files && Array.isArray(req.files.video) && req.files.video.length > 0) {
    videoLocalPath = req.files.video[0].path;
  } else {
    throw new APIerror(500, "failed to uplode video");
  }
  if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  } else {
    throw new APIerror(500, "failed to uplode thumbnail");
  }

  const video = await uplodeFileOnCloudinary(videoLocalPath);

  if (!video?.url) {
    throw new APIerror(500, "faild to uplode video to cloudinery");
  }
  const thumbnail = await uplodeFileOnCloudinary(thumbnailLocalPath);

  if (!thumbnail?.url) {
    throw new APIerror(500, "faild to uplode thumbnail to cloudinery");
  }


  const createdVideo = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    owner: user._id,
    title,
    description,
    duration: video.duration
  })


  return res
    .status(200)
    .json(

      new APIresponse(200, createdVideo, "video uploded sucessfully")

    )

})

const getVideoById = asyncHandler(async (req, res) => {
  const  videoId  = req.params?.videoId;
  const video_id = new mongoose.Types.ObjectId(videoId);
  // console.log(req.query)
  if (!videoId) {
    throw new APIerror(404, " video ID not recived");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: video_id
      }
    },
    {
      $lookup: {
        from: "users",
        as: "videoOwner",
        localField: "owner",
        foreignField: "_id",
        pipeline:[{
          $project: {
          userName: 1,
          _id: 1,
          fullName: 1,
          email: 1,
          avatar: 1

        }}]
      }
    },
    {
      $lookup: {
        as: "likes",
        from: "likes",
        localField: "_id",
        foreignField: "video"
      }
    }, 
    {
      $lookup: {
        // isme comments dhunde 
        as: "comments",
        from: "comments",
        localField: "_id",
        foreignField: "video",
        pipeline: [
          {
            // isme ai user dundene har comment 
            $lookup: {
              from: "users",
              as: "user",
              localField: "owner",
              foreignField: "_id",
              pipeline: [
                // iseme ai fildes chatne
                {
                  $project: {
                    fullName: 1,
                    avatar: 1,
                    userName: 1
                  }
                }
              ]
            }
          },
          {
            // yha mile user jike [0] index pe he object jisme he user details
            // to ise frountend ke liye thoda ssan kar dete he
            $addFields: {
              // over write user 
              user: {
                // user ko over write kar do or ak object dat do user ka 0 index pe he
                $first: "$user"
              }
            }
          } 
        ]
        // yha pe mil gaya comment with use
      }
    },
    {
      $addFields: {
        likes : {
          $size: "$likes"
        }
      }
    }
  ])

  console.log("video : ", video[0])

  return res.status(200)
    .json(
      new APIresponse(200, video[0], "video fetch sucessfully")
    )
})

// delet video

const deleteVideo = asyncHandler( async (req, res) => {
  const userId = req.user?._id;
  if(!userId){
    throw new APIerror(409, "unauthorized riquest can not delete video wthiout login");
  }

  const user_id = new mongoose.Types.ObjectId(userId);

  const videoId = req.params?.video;

  if(!videoId){
    throw new APIerror(409, "video id not recived");
  }

  const video_id = new mongoose.Types.ObjectId(videoId);

  const video = await Video.findById(video_id);

  // delete from cloudinery
  console.log("video : ",video)

  const deleteRisponceByCloudinery = await deleteFileOnCloudniry(video.videoFile,"video");
  const deleteThumbnailRisFromCloudinery = await deleteFileOnCloudniry(video.thumbnail)
  console.log("cloudinery responce : ", deleteRisponceByCloudinery)
  console.log("cloudinery responce : ", deleteThumbnailRisFromCloudinery)

  if(video.owner.equals(user_id)){
    const deleteVideo = await Video.findByIdAndDelete(video_id);
    
    if(!deleteVideo){
      throw new APIerror(500, "failed to delete the video");
    }

    return res
    .status(200)
    .json(
      new APIresponse(200, deleteVideo, "this video is deleted sucessfully")
    )
  }else{
    throw new APIerror(409, "user is not authorized to delete this video");
  }
})

export { getFeed, getSearchResult, uplodeVideo , getVideoById , deleteVideo}

/* 
{"_id":{"$oid":"6893919b26335cc1f0f1e7eb"},"videoFile":"http://res.cloudinary.com/dixsg9gz0/video/upload/v1754501521/rvlhnilvsynwhkmtvdw6.mp4","thumbnail":"http://res.cloudinary.com/dixsg9gz0/image/upload/v1754501529/cjsgaobrb1vqfal7ztn8.png","owner":{"$oid":"6893738172a24b3650db7088"},"title":"test video","description":"first test","duration":{"$numberDouble":"8.783278"},"views":{"$numberInt":"0"},"isPublic":true,"__v":{"$numberInt":"0"}}
*/