import { Router } from "express";
import {registerUser} from '../controllers/registerUser.controllers.js';
const router = Router();

router.route("/regiseter").post(registerUser)

export default router;