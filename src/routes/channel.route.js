import { Router } from "express";
import { getChannelData } from "../controllers/channel.controller.js";

const router = Router();





  router.route("/:channelId/:page").get(getChannelData)



    export default router;