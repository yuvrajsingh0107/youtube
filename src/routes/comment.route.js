import { Router } from 'express';
import {verifyJWT} from '../middlewares/auth.middelwear.js';
import { addComment, deletCommet } from '../controllers/comment.controller.js';
import { upload } from '../middlewares/multer.middelwear.js';

const router = Router();

// addComment 
router.route("/addComment").post(
  upload.none(),
  verifyJWT,
  addComment
)
// deleteComment
router.route("/deletCommet").delete(
  upload.none(),
  verifyJWT,
  deletCommet
  
)

export default router