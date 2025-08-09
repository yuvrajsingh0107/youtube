import  { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middelwear.js';
import { upload } from '../middlewares/multer.middelwear.js';
import { getVideoById, uplodeVideo , deleteVideo, getSearchResult, getFeed } from '../controllers/video.controller.js';

const router = Router()

// uplode video
router.route("/uplodeVideo").post(
  verifyJWT,
  upload.fields([
    {
      name : "video",
      mxaCount: 1
    },
    {
      name: "thumbnail",
      mxaCount: 1
    }
  ]),
  uplodeVideo
)
// getVedioByid ->> play
router.route("/getVideo").get(
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
// abi to bas created at ka base pe 10 videos 
 


// 


export default router