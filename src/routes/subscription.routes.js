import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middelwear.js';
import { upload } from '../middlewares/multer.middelwear.js';
import { getSubscribedChannels, getSubscribers, toggelSubscription } from '../controllers/subscription.controller.js';

const router = Router();

// toggetChannelSubscription
router.route("/:channel").post(
  upload.none(),
  verifyJWT,
  toggelSubscription
)
// getAllSubscribedChannels

router.route("/getSubscribers").get(
  verifyJWT,
  getSubscribers
)
// getAllSubscribers
router.route("/getSubscribedChannels").get(
  verifyJWT,
  getSubscribedChannels
)

export default router;