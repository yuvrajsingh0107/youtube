import {Router} from 'express';
import { toggelCommentLike, toggelVideoLike } from '../controllers/like.controller.js';
import { upload } from '../middlewares/multer.middelwear.js';
import { verifyJWT } from '../middlewares/auth.middelwear.js';

const router = Router();

router.route("/")

//getLikedVideo




// toggelVedioLike
router.route("/v/:video").post(
  upload.none(),
  verifyJWT,
  toggelVideoLike
  // tested
)

// toggelCommentLike
router.route("/c/:comment").post(
  upload.none(),
  verifyJWT,
  toggelCommentLike
  // tested
)
// toggelTweetLike


export default router;