import React, { useRef, useEffect, useState } from "react";
import { useAppStore } from "@/store/store.js";
import moment from "moment";
import apiClient from "@/lib/api-client.js";
import { GET_CHANNEL_MESSAGES_ROUTES, GET_MESSAGES_ROUTES, HOST } from "@/utils/constants.js";
import { MdFolderZip } from "react-icons/md";
import { FiDownload } from "react-icons/fi";
import { IoCloseSharp } from "react-icons/io5";
import { getColor } from "@/lib/utils.js";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const MessageContainer = () => {
  const {
    userInfo,
    selectedChatType,
    selectedChatData,
    selectedChatMessage,
    setSelectedChatMessage,
    setIsDownloading,
    setFileDownloadProgress,
  } = useAppStore();
  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  const scrollRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_MESSAGES_ROUTES,
          {
            id: selectedChatData._id
          },
          {
            withCredentials: true
          }
        );
        if (response.data.messages) {
          setSelectedChatMessage(response.data.messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES_ROUTES}/${selectedChatData._id}`,
          {
            withCredentials: true
          }
        );
        if (response.data.messages) {
          setSelectedChatMessage(response.data.messages);
        }
      } catch (error) {
        console.error("Error fetching channel messages:", error);
      }
    };

      if (selectedChatType === "contact") {
        getMessages();
      } else if (selectedChatType === "channel") {
        getChannelMessages();
      }
  });

  const isAtBottom = () => {
    if (!containerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    return scrollHeight - scrollTop - clientHeight < 50; // 50px tolerance
  };

  useEffect(() => {
    if (isAtBottom() && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessage]);

  const checkIfImage = (filePath) => {
    if (!filePath) return false;
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)$/i;
    return imageRegex.test(filePath);
  };

  const downloadFile = async (url) => {
    try {
      setIsDownloading(true);
      setFileDownloadProgress(0);
      const res = await apiClient.get(`${HOST}/${url}`, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percentCompleted = Math.round((loaded * 100) / total);
          setFileDownloadProgress(percentCompleted);
        },
      });
      const urlBlob = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = urlBlob;
      link.setAttribute("download", url.split("/").pop());
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setIsDownloading(false);
      setFileDownloadProgress(0);
    }
  };

  const renderDMMessages = (message) => (
    <div
      className={`my-3 ${
        message.sender === selectedChatData._id ? "text-left" : "text-right"
      }`}
      key={`dm-${message._id}`}
    >
      {message.messageType === "text" && (
        <div
          className={`${
            message.sender !== selectedChatData._id
              ? "bg-[#8417ff] text-white rounded-br-none"
              : "bg-[#2a2b33] text-white rounded-bl-none"
          } px-4 py-2 rounded-2xl inline-block max-w-[80%] break-words`}
        >
          {message.content}
        </div>
      )}

      {message.messageType === "file" && (
        <div
          className={`${
            message.sender !== selectedChatData._id
              ? "bg-[#8417ff]/10 border-[#8417ff]/40"
              : "bg-[#2a2b33]/10 border-[#ffffff]/20"
          } border rounded-2xl my-2 max-w-[70%] inline-block overflow-hidden`}
        >
          {checkIfImage(message.fileUrl) ? (
            <div
              className="relative group cursor-pointer"
              onClick={() => {
                setShowImage(true);
                setImageURL(message.fileUrl);
              }}
            >
              <img
                src={`${HOST}/${message.fileUrl.replace(/^\/+/, "")}`}
                alt="Message attachment"
                className="rounded-2xl max-w-[250px] max-h-[250px] object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1 py-[1px] rounded-sm opacity-0 group-hover:opacity-100 transition">
                {moment(message.timestamp).format("h:mm A")}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 p-3">
              <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                <MdFolderZip />
              </span>
              <span className="text-white/80 truncate max-w-[150px]">
                {message.fileUrl.split("/").pop()}
              </span>
              <span
                className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300 text-white/80"
                onClick={() => downloadFile(message.fileUrl)}
              >
                <FiDownload />
              </span>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-400 mt-1">
        {moment(message.timestamp).format("h:mm A")}
      </div>
    </div>
  );

  const renderChannelMessages = (message) => {
    const isCurrentUser = message.sender._id === userInfo.id;
    const senderInitial = message.sender.firstName 
      ? message.sender.firstName.charAt(0).toUpperCase()
      : message.sender.email.charAt(0).toUpperCase();

    return (
      <div 
        className={`my-5 ${isCurrentUser ? "text-right" : "text-left"}`}
        key={`channel-${message._id}`}
      >
        {!isCurrentUser && (
          <div className="flex items-center justify-start gap-3 mb-1">
            <Avatar className="h-8 w-8 rounded-full overflow-hidden">
              {message.sender.image && (
                <AvatarImage
                  src={`${HOST}/${message.sender.image}`}
                  alt="profile"
                  className="object-cover h-full w-full bg-black"
                  aria-label="User Profile Image"
                />
              )}
              <AvatarFallback
                className={`uppercase h-8 w-8 font-bold text-sm border flex items-center justify-center rounded-full ${
                  getColor(message.sender.color || "gray")
                }`}
                aria-label="User Initial"
              >
                {senderInitial}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/60">
              {`${message.sender.firstName || ""} ${message.sender.lastName || ""}`.trim()}
            </span>
          </div>
        )}

        {message.messageType === "text" && (
          <div
            className={`${
              !isCurrentUser
                ? "bg-[#8417ff] text-white rounded-br-none"
                : "bg-[#2a2b33] text-white rounded-bl-none"
            } px-4 py-2 rounded-2xl inline-block max-w-[80%] break-words`}
          >
            {message.content}
          </div>
        )}

        {message.messageType === "file" && (
          <div
            className={`${
              !isCurrentUser
                ? "bg-[#8417ff]/10 border-[#8417ff]/40"
                : "bg-[#2a2b33]/10 border-[#ffffff]/20"
            } border rounded-2xl my-2 max-w-[70%] inline-block overflow-hidden`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className="relative group cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message.fileUrl);
                }}
              >
                <img
                  src={`${HOST}/${message.fileUrl.replace(/^\/+/, "")}`}
                  alt="Message attachment"
                  className="rounded-2xl max-w-[250px] max-h-[250px] object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4 p-3">
                <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                  <MdFolderZip />
                </span>
                <span className="text-white/80 truncate max-w-[150px]">
                  {message.fileUrl.split("/").pop()}
                </span>
                <span
                  className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300 text-white/80"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <FiDownload />
                </span>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-400 mt-1">
          {moment(message.timestamp).format("h:mm A")}
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    if (!selectedChatMessage?.length) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          No messages yet
        </div>
      );
    }

    let lastDate = null;
    return selectedChatMessage.map((message) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={message._id} className="px-2">
          {showDate && (
            <div className="text-center text-gray-500 text-sm my-4">
              {moment(message.timestamp).format("MMMM D, YYYY")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "channel" && renderChannelMessages(message)}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 p-4 px-6 md:px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full relative h-full">
      <div 
        ref={containerRef}
        className="absolute inset-0 overflow-y-auto scrollbar-hide px-2 pb-4"
      >
        {renderMessages()}
        <div ref={scrollRef} />
      </div>

      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col bg-black/80">
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={`${HOST}/${imageURL}`}
              alt="Expanded view"
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-3xl"
            />
          </div>
          <div className="flex gap-5 fixed top-4 right-4">
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300 text-white"
              onClick={() => downloadFile(imageURL)}
              aria-label="Download image"
            >
              <FiDownload />
            </button>
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300 text-white"
              onClick={() => {
                setShowImage(false);
                setImageURL(null);
              }}
              aria-label="Close image"
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;