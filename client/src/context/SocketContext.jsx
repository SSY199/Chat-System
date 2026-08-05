import { useAppStore } from "@/store/store.js";
import { HOST } from "@/utils/constants.js";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "./SocketProvider";

const getId = (value) => {
  if (value == null) return value;
  if (typeof value === "object") return value._id ?? value.id;
  return value;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const userInfo = useAppStore((state) => state.userInfo);

  useEffect(() => {
    if (!userInfo?.id) {
      setSocket(null);
      return;
    }

    const newSocket = io(HOST, {
      auth: { userId: userInfo.id },
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    const handleReceiveMessage = (message) => {
      const { selectedChatData, selectedChatType, addMessage, addContactsInDMContacts } =
        useAppStore.getState();

      const senderId = String(getId(message.sender));
      const recipientId = String(getId(message.recipient));
      const chatId = selectedChatData?._id != null ? String(selectedChatData._id) : null;

      if (
        selectedChatType !== undefined &&
        chatId &&
        (chatId === senderId || chatId === recipientId)
      ) {
        console.log("Message received:", message);
        addMessage(message);
      }
      addContactsInDMContacts(message);
    };

    const handleReceiveChannelMessage = (message) => {
      const { addMessage, selectedChatData, selectedChatType, addChannelInList } =
        useAppStore.getState();

      const chatId = selectedChatData?._id != null ? String(selectedChatData._id) : null;
      const channelId = message.channelId != null ? String(message.channelId) : null;

      if (selectedChatType !== undefined && chatId && chatId === channelId) {
        addMessage(message);
      }
      addChannelInList(message);
    };

    newSocket.on("receiveMessage", handleReceiveMessage);
    newSocket.on("receive-channel-message", handleReceiveChannelMessage);

    setSocket(newSocket);

    return () => {
      newSocket.off("receiveMessage", handleReceiveMessage);
      newSocket.off("receive-channel-message", handleReceiveChannelMessage);
      newSocket.disconnect();
      setSocket(null);
    };
  }, [userInfo?.id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
