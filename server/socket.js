import { Server } from "socket.io";
import Message from "./models/contact.model.js";
import Channel from "./models/channel.model.js";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const sendMessage = async (message) => {
    try {
      const senderSocketId = userSocketMap.get(String(message.sender));
      const recipientSocketId = userSocketMap.get(String(message.recipient));

      const createdMessage = await Message.create(message);

      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "email firstName lastName image color")
        .populate("recipient", "email firstName lastName image color");

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessage", messageData);
      }
      if (senderSocketId) {
        io.to(senderSocketId).emit("receiveMessage", messageData);
      }
    } catch (err) {
      console.error("Error in sendMessage:", err.message);
    }
  };

  const sendChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileUrl } = message;

    try {
      const createdMessage = await Message.create({
        sender,
        recipient: null,
        content,
        messageType,
        timestamp: new Date(),
        fileUrl,
      });

      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "email firstName lastName image color")
        .exec();

      const channel = await Channel.findById(channelId).populate("members");
      if (!channel) {
        console.error(`Channel not found with ID: ${channelId}`);
        return;
      }

      await Channel.findByIdAndUpdate(
        channelId,
        {
          $push: {
            messages: createdMessage._id,
          },
        },
        { new: true }
      );

      const finalData = {
        ...messageData.toObject(),
        channelId: channel._id,
      };

      const recipientIds = new Set();

      if (channel.members) {
        channel.members.forEach((member) => {
          recipientIds.add(member._id.toString());
        });
      }

      if (channel.admin) {
        recipientIds.add(channel.admin.toString());
      }

      recipientIds.forEach((userId) => {
        const socketId = userSocketMap.get(userId);
        if (socketId) {
          io.to(socketId).emit("receive-channel-message", finalData);
        }
      });
    } catch (err) {
      console.error("Error in sendChannelMessage:", err.message);
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId
      ? String(socket.handshake.auth.userId)
      : null;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    } else {
      console.log("User ID not provided in handshake query.");
    }

    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendChannelMessage);
    socket.on("disconnect", () => {
      // Only clear the map if this socket is still the active one for the user.
      // Prevents a stale disconnect from wiping a newer connection.
      if (userId && userSocketMap.get(userId) === socket.id) {
        userSocketMap.delete(userId);
        console.log(`User ${userId} disconnected with socket ID: ${socket.id}`);
      }
    });
  });

  return io;
};
