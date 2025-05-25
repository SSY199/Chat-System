import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // For direct messages
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  // For group/channel messages
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channel",
    required: false,
  },
  messageType: {
    type: String,
    enum: ["text", "image", "video", "audio", "file"],
    default: "text",
  },
  content: {
    type: String,
    required: function() {
      return this.messageType === "text";
    },
  },
  fileUrl: {
    type: String,
    required: function() {
      return this.messageType !== "text";
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Added for better query performance
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent"
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
