import React from "react";
import { useAppStore } from "@/store/store.js";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils.js";
import { HOST } from "@/utils/constants.js";

const ContactList = ({ contacts, isChannel }) => {
  const {
    setSelectedChatType,
    selectedChatData,
    setSelectedChatData,
    setSelectedChatMessage,
  } = useAppStore();

  const handleContactClick = (contact) => {
    if (isChannel) {
      setSelectedChatType("channel");
    } else {
      setSelectedChatType("contact");
    }
    setSelectedChatData(contact);
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessage([]);
    }
  };

  return (
    <div className="mt-5">
      {contacts.map((contact) => (
        <div
          className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${
            selectedChatData && (selectedChatData._id === contact._id)
              ? "bg-[#8417ff] hover:bg-[#8417ff]"
              : "hover:bg-[#f1f1f111]"
          }`}
          onClick={() => handleContactClick(contact)}
          key={contact._id}
        >
          <div className="flex gap-5 items-center justify-start text-neutral-300">
            {!isChannel && (
              <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                {contact.image ? (
                  <AvatarImage
                    src={`${HOST}/${contact.image}`}
                    alt="profile"
                    className="object-cover h-full w-full bg-black"
                    aria-label="User Profile Image"
                  />
                ) : (
                  <div
                    className={`
                      ${selectedChatData && selectedChatData._id === contact._id ? "bg-[ffffff22] border border-white/70" : getColor(contact.color)}
                      uppercase h-10 w-10 font-bold text-lg border flex items-center justify-center rounded-full ${getColor(
                      contact.color || "gray"
                    )}`}
                    aria-label="User Initial"
                  >
                    {contact.firstName?.charAt(0) ||
                      contact.email?.charAt(0)}
                  </div>
                )}
              </Avatar>
            )}
            {
              isChannel && <div className="bg-[#ffffff22] w-10 h-10 rounded-full flex items-center justify-center">
                #
                </ div>
                
            }
            {
                  isChannel ? <span>{contact.name}</span> : (<span>{contact.firstName  ? `${contact.firstName} ${contact.lastName}` : contact.email}</span>)
                }
          </div>
        </div>
      ))}
    </div>
  );
};
export default ContactList;