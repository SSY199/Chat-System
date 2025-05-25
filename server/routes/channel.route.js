import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  createChannel,
  getChannelMessages,
  getChannels,
} from "../controllers/channel.controller.js";

const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-channels", verifyToken, getChannels);
channelRoutes.get("/get-channel-messages/:channelId", verifyToken, getChannelMessages);

export default channelRoutes;
