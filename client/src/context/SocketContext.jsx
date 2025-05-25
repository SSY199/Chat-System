import { useAppStore } from "@/store/store.js";
import { HOST } from "@/utils/constants.js";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "./SocketProvider";



export const SocketProvider = ({ children }) => {
  const socketRef = useRef();
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      console.log("Connecting socket with userId:", userInfo.id);
      socketRef.current = io(HOST, {
        auth: { userId: userInfo.id },
        withCredentials: true,
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current.id);
      });

      const handleReceiveMessage = (message) => {
        const { selectedChatData, selectedChatType, addMessage, addContactsInDMContacts } =
          useAppStore.getState();

        const senderId = message.sender._id;
        const recipientId = message.recipient._id;

        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === senderId ||
            selectedChatData._id === recipientId)
        ) {
          console.log("Message received:", message);
          addMessage(message);
        }
        addContactsInDMContacts(message);
      };

      const handleReceiveChannelMessage = (message) => {
        const { addMessage, selectedChatData, selectedChatType, addChannelInList } =
          useAppStore.getState();

        if (
          selectedChatType !== undefined &&
          selectedChatData._id === message.channelId
        ) {
          // console.log("Channel message received:", message);
          addMessage(message);
        }
        addChannelInList(message);
      };

      socketRef.current.on("receiveMessage", handleReceiveMessage);
      socketRef.current.on(
        "recieve-channel-message",
        handleReceiveChannelMessage
      );

      return () => {
        socketRef.current.disconnect();
        console.log("Socket disconnected");
      };
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
