import { Router } from "express";
import {verifyJWT} from '../middlewares/auth.middelwear.js';
import { upload } from "../middlewares/multer.middelwear.js";
import { createTweet , getTweetFeed } from "../controllers/tweet.controller.js";

const router = Router()

// createTweet
router.route("/create").post(verifyJWT,
  upload.none(),
  verifyJWT,
  createTweet)
// updateTweet
// getUsersAllTweet
// router.route("/getUserTweets/:page").get(
//   // getUserTweets
// )
// TweetFeed
router.route("/feed/:page").get(
  getTweetFeed
)

// like tweet 

router.route("/:tweetId/like").post(
  upload.none(),
  verifyJWT,
  
)
// getTweetById
// deleteTweet

export default router;