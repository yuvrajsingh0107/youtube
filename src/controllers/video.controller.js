import { Video } from "../models/video.model.js"
import { Like } from "../models/likes.models.js";
import { Comment } from '../models/comments.models.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { APIerror } from '../utils/APIerror.js';
import { APIresponse } from '../utils/APIresponse.js';
// import cloudnery from '../utils/cloudinary.js';
import { uplodeFileOnCloudinary } from '../utils/cloudinary.js';
// import getVideoDurationInSeconds from "get-video-duration"
// import fs from "fs";


// panding he abhi aggrigation pipeline
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
  const duration = video.duration;


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
  const { videoId } = req.params?.videoId;
  console.log(req.params)
  if (!videoId) {
    throw new APIerror(404, " video ID not recived");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: videoId
      }
    },
    {
      $lookup: {
        as: "likes",
        from: "likes",
        localField: "_id",
        foreignField: "video"

      }
    }, {
      $lookup: {
        as: "comments",
        from: "comments",
        localField: "_id",
        foreignField: "video"
      }
    },{
      $addFields: {
        likes: {
          $size: "$likes"
        },
        comments: "$comments"
      }
    },
    {
      $project: {
        videoFile,
        thumbnail,
        owner,

      }
    }
  ])

  return res.status(200)
    .json(
      new APIresponse(200, video, "video fetch sucessfully")
    )
})

export { uplodeVideo }

/* 
{"_id":{"$oid":"6893919b26335cc1f0f1e7eb"},"videoFile":"http://res.cloudinary.com/dixsg9gz0/video/upload/v1754501521/rvlhnilvsynwhkmtvdw6.mp4","thumbnail":"http://res.cloudinary.com/dixsg9gz0/image/upload/v1754501529/cjsgaobrb1vqfal7ztn8.png","owner":{"$oid":"6893738172a24b3650db7088"},"title":"test video","description":"first test","duration":{"$numberDouble":"8.783278"},"views":{"$numberInt":"0"},"isPublic":true,"__v":{"$numberInt":"0"}}
*/