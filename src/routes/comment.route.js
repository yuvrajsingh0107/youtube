import { Router } from 'express';
import {verifyJWT} from '../middlewares/auth.middelwear.js';
import { getAllcomments, addComment, deletCommet, updateComment } from '../controllers/comment.controller.js';
import { upload } from '../middlewares/multer.middelwear.js';

const router = Router();

router.route("/getAllComments/:videoId/:page").get(
  getAllcomments
)

// addComment  
router.route("/addComment").post(
  upload.none(),
  verifyJWT,
  addComment
  // tested
)
 
// deleteComment
router.route("/deleteComment/:_id").delete(
  upload.none(),
  verifyJWT,
  deletCommet
  
)

// updatecomment
router.route("/update/:commentId").patch(
  upload.none(),
  verifyJWT,
  updateComment
// tested
)

export default router