import React, { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { RiEmojiStickerLine } from "react-icons/ri";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { useAppStore } from "@/store/store.js";
import { useSocket } from "@/context/useSocket";
import apiClient from "@/lib/api-client.js";
import { FILE_UPLOAD_ROUTE } from "@/utils/constants.js";
// import { data } from "react-router-dom";

const MessageBar = () => {
  const [message, setMessage] = useState("");
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const emojiRef = useRef();
  const fileInputRef = useRef();
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    setIsUploading,
    setFileUploadProgress,
  } = useAppStore();
  const socket = useSocket();

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setIsEmojiPickerVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  const handleAddEmoji = (emojiObject) => {
    setMessage((msg) => msg + emojiObject.emoji);
  };

  const handleSendMessage = async () => {
    if (selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: userInfo.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
      });
    } else if (selectedChatType === "channel") {
      socket.emit("send-channel-message", {
        sender: userInfo.id,
        content: message,
        messageType: "text",
        fileUrl: undefined,
        channelId: selectedChatData._id,
      });
    }
    setMessage("");
  };

  const handleSendFile = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSendFileChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        setIsUploading(true);
        const res = await apiClient.post(FILE_UPLOAD_ROUTE, formData, {
          withCredentials: true,
          // headers: {
          //   "Content-Type": "multipart/form-data",
          // },
          onUploadProgress: (data) => {
            setFileUploadProgress(Math.round(100 * data.loaded) / data.total);
          },
        });
        if (res.status === 200) {
          setIsUploading(false);
          if (selectedChatType === "contact") {
            socket.emit("sendMessage", {
              sender: userInfo.id,
              content: message,
              recipient: selectedChatData._id,
              messageType: "file",
              fileUrl: res.data.filePath,
            });
          }
        } else if (selectedChatType === "channel") {
          socket.emit("send-channel-message", {
            sender: userInfo.id,
            content: undefined,
            messageType: "file",
            fileUrl: res.data.filePath,
            channelId: selectedChatData._id,
          });
        }
      }
    } catch (error) {
      setIsUploading(false);
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="h-[12vh] bg-[#1c1d25] flex justify-center items-center px-6 py-4 gap-4">
      <div className="flex-1 flex bg-[#2a2b33] rounded-full items-center gap-3 pr-4 shadow-lg">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-4 bg-transparent rounded-full text-white placeholder-gray-400 focus:outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <div className="relative">
          <button
            className="text-gray-400 hover:text-white transition-all duration-300"
            onClick={handleSendFile}
          >
            <GrAttachment size={24} />
          </button>
          <input
            type="file"
            className="hidden"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleSendFileChange}
            name="file"
          />
        </div>
        <div className="relative">
          <button
            className="text-gray-400 hover:text-white transition duration-300"
            onClick={() => setIsEmojiPickerVisible(!isEmojiPickerVisible)}
          >
            <RiEmojiStickerLine size={24} />
          </button>
          {isEmojiPickerVisible && (
            <div
              className="absolute bottom-12 right-0 shadow-lg rounded-lg"
              ref={emojiRef}
            >
              <EmojiPicker
                theme="dark"
                onEmojiClick={(emojiObject) => handleAddEmoji(emojiObject)}
                autoFocusSearch={false}
              />
            </div>
          )}
        </div>
      </div>
      <button
        className="bg-[#8417ff] p-4 rounded-full shadow-lg hover:bg-[#6e14d9] transition-all duration-300 transform hover:scale-110 focus:outline-none"
        onClick={handleSendMessage}
      >
        <IoSend size={24} className="text-white" />
      </button>
    </div>
  );
};

export default MessageBar;
