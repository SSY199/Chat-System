import { Router } from "express";
import { deleteProfileImage, getUserInfo, login, logout, signup, updateProfile, updateProfileImage } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import multer from "multer";

const authRoutes = Router();
const upload = multer({ dest: "uploads/profiles" });

authRoutes.post("/signup", signup );
authRoutes.post("/login", login);
authRoutes.get("/user-info",verifyToken, getUserInfo);
authRoutes.post("/update-profile", verifyToken, updateProfile);
authRoutes.post("/update-profile-image", verifyToken, upload.single("profileimage"), updateProfileImage);
authRoutes.delete("/delete-profile-image", verifyToken, deleteProfileImage);
authRoutes.post("/logout", logout);


export default authRoutes;