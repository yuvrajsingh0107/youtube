import { Router } from "express";
import fs from "fs"

import {loginUser, logoutUser, registerUser, refreshAccessToker} from '../controllers/registerUser.controllers.js';
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

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT , logoutUser);

router.route("refresh-token").post(refreshAccessToker)

router.route("/updateAvatar").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    }
  ])
)

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