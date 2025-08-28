import  { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middelwear.js';
import { upload } from '../middlewares/multer.middelwear.js';
import { getVideoById, uplodeVideo , deleteVideo, getSearchResult, getFeed, getchannelVideos } from '../controllers/video.controller.js';

const router = Router()

// uplode video uplodeVideo
router.route("/uplodeVideo").post(
  verifyJWT,
  upload.fields([
    { 
      name : "video",
      maxCount: 1
     },
     {
       name: "thumbnail", 
       maxCount: 1 
      }
    ]),
  uplodeVideo
)
// getVedioByid ->> play
router.route("/getVideo/:videoId").get(
  getVideoById
)


// delet video
router.route("/delete/:video").delete(
  verifyJWT,
  deleteVideo
)

// search query 
router.route("/search").get(
  getSearchResult
)


// FeedVedio

router.route("/feed").get(
  getFeed
)


// video of specfic user
router.route("/getChannelVideos/:userId/:page").get(
  
    getchannelVideos
  )



export default router