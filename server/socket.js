import { Server } from "socket.io";
import Message from "./models/contact.model.js";
import Channel from "./models/channel.model.js";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [process.env.ORIGIN, "https://chat-system-frontend-og79.onrender.com"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnectUser = (userId, socket) => {
    console.log(`User ${userId} disconnected with socket ID: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    try {
      const senderSocketId = userSocketMap.get(message.sender);
      const recipientSocketId = userSocketMap.get(message.recipient);

      const createdMessage = await Message.create(message);

      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .populate("recipient", "id email firstName lastName image color");

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
        .populate("sender", "id email firstName lastName image color")
        .exec();

      // First check if channel exists
      const channel = await Channel.findById(channelId).populate("members");
      if (!channel) {
        console.error(`Channel not found with ID: ${channelId}`);
        return; // Exit if channel doesn't exist
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

      const finalData = { ...messageData._doc, channelId: channel._id };

      // Send to members
      if (channel.members) {
        channel.members.forEach((member) => {
          const memberSocketId = userSocketMap.get(member._id.toString());
          if (memberSocketId) {
            io.to(memberSocketId).emit("receive-channel-message", finalData);
          }
        });
      }

      // Send to admin if exists
      if (channel.admin) {
        const adminSocketId = userSocketMap.get(channel.admin._id.toString());
        if (adminSocketId) {
          io.to(adminSocketId).emit("receive-channel-message", finalData);
        }
      }
    } catch (err) {
      console.error("Error in sendChannelMessage:", err.message);
    }
  };
  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    } else {
      console.log("User ID not provided in handshake query.");
    }

    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendChannelMessage);
    socket.on("disconnect", () => disconnectUser(userId, socket));
  });

  return io;
};
