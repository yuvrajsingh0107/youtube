import mongoose from "mongoose";
import { APIerror } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Subscription} from '../models/subscription.models.js';
import { APIresponse } from "../utils/APIresponse.js";


// checkIsSubscribed
const checkIsSubscribed = asyncHandler(async (req, res) => {
  if(!req.user){
    throw new APIerror(401,"user not login", "error");
  }
try {
  
    const userId = req.user._id;
  
    const channelId = req.params?.channelId;
  
    const isSubscribe = await Subscription.findOne({
      subscriber: userId,
      channel: channelId
    })
  console.log("is subscribed : ", isSubscribe)
    if(isSubscribe){
      return res
      .status(200)
      .json({subscribed: true})
    }else {
      return res
      .status(200)
      .json({subscribed: false})
    }
} catch (error) {
  console.error(error);
  throw new APIerror(500,error.message, error);
}

})

// toggel subscription 
const toggelSubscription = asyncHandler(async (req, res) => {
  // user --> loged in
  const userId = req.user?._id;
  if(!userId){
    throw new APIerror(445, "user not logged in")
  }

  const user_id = new mongoose.Types.ObjectId(userId);


  // channel 
  const channelId = req.params?.channel;
  if(!channelId){
    throw new APIerror(409, "channel (user) id is missing");
  }
  const channel_id = new mongoose.Types.ObjectId(channelId);


  async function help () {
    const subscription = await Subscription.findOne({
      subscriber: user_id,
      channel: channel_id
    })

    if(!subscription){
      return {
        isSubscribed: false,
        subscription_id: null
      }
    }else{
      return {
        isSubscribed: true,
        subscription_id: subscription._id
      }
    }
  }

  const {isSubscribed , subscription_id} = await help()

  if(isSubscribed){
    const removedSunbscription = await Subscription.findByIdAndDelete(subscription_id)

    if(removedSunbscription){
      return res
      .status(200)
      .json(
        new APIresponse(200, removedSunbscription ,"subscriber removed sucessfully")
      )
    }else{
      return res
      .status(500)
      .json(
        new APIresponse(500, "failed to remove subsceribe")
      )
    }
  }else{
    const newSubscription = await Subscription.create({
      subscriber: user_id,
      channel: channel_id
    })

    if(newSubscription){
      return res
      .status(200)
      .json(
        new APIresponse(200, newSubscription, "channel subscribed sucessfully")
      )
    }
  }
  



  // if(subscribed ) then unsuscribe
  // else subsscribe
})

// get user channel subscribers
const getSubscribers = asyncHandler( async (req, res) => {
  const channelId = req.user?._id;
  if(!channelId){
    throw new APIerror(409, " unauthorized riquest user not login get subscriber");
  }

  const channel_id = new mongoose.Types.ObjectId(channelId);

const subscribers = await Subscription.aggregate([
  {
    $match: {
      channel: channel_id,
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "subscriber",
      foreignField: "_id",
      as: "subscriberInfo",
      pipeline: [
        {
          $project: {
            userName: 1,
            email: 1,
            fullName: 1,
            _id: 1,
            avatar: 1
          }
        }
      ]
    }
  },
  {
    $unwind: "$subscriberInfo"
  }
]);

  return res
  .status(200)
  .json(
    new APIresponse(200, subscribers, "sucess")
  )

})

// get all user subscribed channel
const getSubscribedChannels = asyncHandler( async (req, res) => {
  const userId = req.user?._id;
  if(!userId){
    throw new APIerror(400, "unauthorize use : uaer not login :: get subscribed channels");
  }

  const user_id = new mongoose.Types.ObjectId(userId);

  const subscribedChannels = await Subscription.aggregate(
    [
      {
        $match:{
          subscriber: user_id
        }
      },
      {
        $lookup:{
          as: "channelInfo",
          from: "users",
          localField: "channel",
          foreignField: "_id",
          pipeline: [
            
            {
              $project: {
                avatar: 1,
                fullName: 1,
                userName: 1,
                email: 1,
                _id: 1,
              }
            }
          ] 
        }
      },
      
      
      
      // {
      //   
      // }
    ]
  )


  if(!subscribedChannels){
    throw new APIerror(404, "not found ")
  }

  return res
  .status(200)
  .json(
    new APIresponse(200, subscribedChannels, "sucess")  
  )
})

export {checkIsSubscribed , toggelSubscription , getSubscribers , getSubscribedChannels}