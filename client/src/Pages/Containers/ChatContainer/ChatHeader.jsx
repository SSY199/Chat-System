import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/store.js";
import React from "react";
import { RiCloseFill } from "react-icons/ri";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils.js";
import { HOST } from "@/utils/constants.js";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType } = useAppStore();

  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between">
      <div className="flex gap-5 items-center w-full justify-between px-5">
        <div className="flex gap-3 items-center justify-center">
          <div className="w-12 h-12 md:w-16 md:h-16 relative">
            {
              selectedChatType === "contact" ? (
                <Avatar className="h-12 w-12 rounded-full overflow-hidden mt-2">
              {selectedChatData.image ? (
                <AvatarImage
                  src={`${HOST}/${selectedChatData.image}`}
                  alt="profile"
                  className="object-cover h-full w-full bg-black"
                  aria-label="User Profile Image"
                />
              ) : (
                <div
                  className={`uppercase h-full w-full font-bold text-lg border flex items-center justify-center rounded-full ${getColor(
                    selectedChatData.color || "gray"
                  )}`}
                  aria-label="User Initial"
                >
                  {selectedChatData.firstName?.charAt(0) ||
                    selectedChatData.email?.charAt(0)}
                </div>
              )}
            </Avatar>
              ) : (
                <div className="bg-[#ffffff22]  w-15 h-15 rounded-full flex items-center text-2xl justify-center">
                #
                </ div>
              )
            }
          </div>
          <div className="">
            <div className="font-bold text-lg">{selectedChatData.name}</div>

            {selectedChatType === "contact" && selectedChatData.firstName
              ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
              : selectedChatData.email || ""}
          </div>
        </div>
        <div className="flex items-center justify-center gap-5">
          <Button
            variant="ghost"
            className="text-[#8b8c9a] hover:text-[#ffffff] hover:bg-[#2f303b] rounded-full p-2 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            onClick={closeChat}
          >
            <RiCloseFill
              size={22}
              className="cursor-pointer text-white hover:text-red-500 transition-transform duration-300"
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;