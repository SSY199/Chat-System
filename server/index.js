import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import contactsRoutes from "./routes/contact.route.js";
import { setupSocket } from "./socket.js";
import messageRoutes from "./routes/message.route.js";
import channelRoutes from "./routes/channel.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 7000;
const databaseUrl = process.env.DATABASE_URL;

app.use(
  cors({
    origin: [process.env.ORIGIN],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/channel", channelRoutes);

const server = app.listen(port, "0.0.0.0", () => {  // Add "0.0.0.0"
  console.log(`Server is running on port ${port}`);
});

setupSocket(server);

mongoose
  .connect(databaseUrl)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });
