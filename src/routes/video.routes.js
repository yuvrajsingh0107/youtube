import  { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middelwear.js';
import { upload } from '../middlewares/multer.middelwear.js';
import { uplodeVideo } from '../controllers/video.controller.js';

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
  
)
// delet video
// add comment
// FeedVedio
// 


export default router