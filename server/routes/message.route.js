import { Router } from "express";
import { getMessages, uploadFile } from "../controllers/message.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import multer from "multer";


const messageRoutes = Router();
const upload = multer({ dest: "uploads/files" });

messageRoutes.post("/get-messages",verifyToken, getMessages);
messageRoutes.post("/upload-file",verifyToken, upload.single("file"), uploadFile);

export default messageRoutes;
