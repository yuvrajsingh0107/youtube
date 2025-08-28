import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { APIresponse } from "../utils/APIresponse.js";

const getChannelData = asyncHandler(async (req, res) => {
  const userId = req.params?.channelId;
  const page = req.params?.page;
  const _id = new mongoose.Types.ObjectId(userId);
  let skipValue = 0;
  if (page) {
    skipValue = (page - 1) * 10;
  }
  // channel page 
  // channel ke ander chaiye
  // username , email , fullName , avatar , coverImage , subscriberCount , subscribedChannelCount , createdAt
  // totalLikes ,  totalVideos  , totalViews

  const channelInfo = await User.aggregate([
    {
      $match: {
        _id: _id
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
        as: "subscribed",
        localField: "_id",
        foreignField: "subscriber"
      }
    },
    {
      $lookup: {
        from: "videos",
        as: "totalvideos",
        localField: "_id",
        foreignField: 'owner',
        pipeline: [{
          $project: {
            _id: 1,
            views: 1
          }
        }]
      }
    },
    {
      $lookup: {
      from: "likes",
      let: { videoIds: "$totalvideos._id" },
      pipeline: [
        { $match: { $expr: { $in: ["$video", "$$videoIds"] } } }
      ],
      as: "likes"
      }
    },
    {
      $project: {
        userName: 1,
        email: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        createdAt: 1,
        subscribers: { $size: "$subscribers" },
        subscribed: { $size: "$subscribed" },
        totalVideos: { $size: "$totalvideos" },
        totalViews: { $sum: "$totalvideos.views" },
        likes: { $size: "$likes" }
      }
    }    
  ])


    // video array of size 10
  // video ke ander chaiye
  // _id , title , description , thumbnail , views , createdAt , ownerInfo
  // ownerInfo ke ander chaiye
  // _id , userName , fullName , avatar

  const videos = await Video.aggregate([
    {
      $skip: skipValue
    },
    {
      $limit: 10
    },
    {
      $match: {
        owner: _id
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        thumbnail: 1,
        views: 1,
        createdAt: 1,
        
      }
    }
  ])
return res
.status(200)
.json( new APIresponse(200, { channelInfo: channelInfo[0], videos }, "channel info fetched successfully"))
})

export { getChannelData };