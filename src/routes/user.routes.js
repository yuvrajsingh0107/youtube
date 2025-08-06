import { Router } from "express";
import fs from "fs"

import {loginUser,
       logoutUser,
       registerUser, 
       refreshAccessToker, 
       updateAvatar, 
       updateCoverImage, 
       updateFullName, 
       getCurrentUser, 
       changePassword, 
       getUserChannelProfile, 
       getUserWatchHistory} from '../controllers/registerUser.controller.js';
import { upload } from "../middlewares/multer.middelwear.js"
import { verifyJWT } from "../middlewares/auth.middelwear.js";
const router = Router();

const folderPath = "./public/photos";
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}


router.route("/regiseter").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverImage",
      maxCount: 1
    }
  ]),
  registerUser
)

router.route("/getUseer").get(verifyJWT,getCurrentUser)

router.route("/login").post(upload.none(),loginUser);

router.route("/logout").post(verifyJWT , logoutUser);

router.route("refresh-token").post(refreshAccessToker)

router.route("/updateAvatar").patch(
  verifyJWT,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    }
  ]),
  updateAvatar
)

router.route("/updateCoverImage").patch(
  verifyJWT,
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1
    }
  ]),
  updateCoverImage
)

router.route("/updateFullName").patch(  upload.none(),  verifyJWT,  updateFullName)


router.route("/changePassword").post(  upload.none(),  verifyJWT,  changePassword)


router.route("/c/:userName").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT, getUserWatchHistory);

export default router;

/*
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )
*/