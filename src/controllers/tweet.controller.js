import { Tweet } from "../models/tweet.models.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from '../models/likes.models.js';


// create
const createTweet = (async (req, res) => {
  
  if (!req.user) {
    throw new APIerror(401, "you are not authorized to create tweet");
  }

  const { title, content } = req.body;
  if (!title || !content) {
    throw new APIerror(400, "title and content are required to create tweet");
  }
  console.log("tweet", content)

  try {
    const tweet = await Tweet.create({
      title,
      content,
      owner: req.user._id
    });
    res.status(201).json(new APIresponse(201, tweet, "tweet created successfully"));
  } catch (error) {
    throw new APIerror(500, "failed to create tweet");
  }

})
// get user all tweet

// updatet tweets

// delete tweet

// get tweet in feed
const getTweetFeed = asyncHandler(async (req, res) => {
  const { page } = req?.params;
  const PAGE_SIZE = 5;
  const skip = (page - 1) * PAGE_SIZE;

  try {
    const tweets = await Tweet.aggregate([
      {
        $skip: skip
      },
      {
        $limit: PAGE_SIZE
      },
      {
        $lookup: {
          from: "users",
          as: "owner",
          foreignField: "_id",
          localField: "owner",
          pipeline: [
            {
              $project: {
                userName: 1,
                fullName: 1,
                avatar: 1
              }
            }
          ]
        },
      },
      {
        $lookup: {
          from: "likes",
          as: "likes",
          foreignField: "tweet",
          localField: "_id"
        }
      },
      {
        $project: {
          likes: {
            $size: "$likes"
          },
          title: 1,
          content: 1,
          owner: {
            $arrayElemAt: ["$owner", 0]
          },
          createdAt: 1
        }
      }
    ])
    res.status(200).json(new APIresponse(200, tweets, "tweets fetched successfully"));
  } catch (error) {
    throw new APIerror(500, error.message);
  }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const user = req.user;
  if(!user){
    throw new APIerror(409, "unatuherized riquest");
  }
  const {tweetId} = req.params;
  if(!tweetId){
    throw new APIerror(404, "tweet Id is missing");
  }

  const like = await Like.findOne({
    likedBy: user._id,
    tweet: tweetId
  })

  if(like){
    const res = await Like.findByIdAndDelete(like._id);
    console.log(res)
  }
})

export { createTweet, getTweetFeed }
