import { Router } from 'express';
import {verifyJWT} from '../middlewares/auth.middelwear.js';
import { addComment, deletCommet, updateComment } from '../controllers/comment.controller.js';
import { upload } from '../middlewares/multer.middelwear.js';

const router = Router();

// addComment 
router.route("/addComment").post(
  upload.none(),
  verifyJWT,
  addComment
  // tested
)

// deleteComment
router.route("/deletCommet").delete(
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