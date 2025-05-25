import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Lottie from "lottie-react";
import { animationDefaultOptions } from "@/lib/utils.js";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api-client.js";
import { SEARCH_CONTACTS_ROUTES } from "@/utils/constants.js";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HOST } from "@/utils/constants.js";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils.js";
import { useAppStore } from "@/store/store.js";

const NewDm = () => {

  const { setSelectedChatType, setSelectedChatData } = useAppStore();
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);
  //const { userInfo } = useAppStore();

  const searchContact = async (searchTerm) => {
    try {
      if(searchTerm.length > 0) {
        const response = await apiClient.post(SEARCH_CONTACTS_ROUTES, {
          searchTerm,
        }, {
          withCredentials: true,
        });
        
        if(response.status === 200) {
          setSearchedContacts(response.data.contacts);
        } else {
          setSearchedContacts([]);
        }
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  } 

  const selectNewContact = async (contact) => {
    try {
      setOpenNewContactModal(false);
      setSelectedChatType("contact");
      setSelectedChatData(contact);
      setSearchedContacts([]);
      // const response = await apiClient.post(SEARCH_CONTACTS_ROUTES, {
      //   searchTerm,
      // }, {
      //   withCredentials: true,
      // });
      
      // if(response.status === 200) {
      //   setSearchedContacts(response.data.contacts);
      // } else {
      //   setSearchedContacts([]);
      // }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  }

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
              onClick={() => setOpenNewContactModal(true)}
            />
            <TooltipContent
              side="top"
              className="bg-[#1c1b1e] border-none mb-2 p-3 text-white rounded-md shadow-lg"
            >
              Select a new contact
            </TooltipContent>
          </TooltipTrigger>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>Select a Contact</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="px-2">
            <Input
              type="text"
              placeholder="Search for a contact..."
              className="bg-[#1c1b1e] border-none text-white w-full h-10 rounded-lg shadow-lg mb-4"
              onChange={(e) => searchContact(e.target.value)}
            />
          </div>
          {searchedContacts.length > 0 && (
            <ScrollArea className="h-[250px] w-full rounded-md border-none bg-[#181920]">
              <div className="flex flex-col gap-5">
                {searchedContacts.map((contact) => (
                  <div
                    className="flex gap-3 items-center cursor-pointer"
                    key={contact._id}
                    onClick={() => selectNewContact(contact)}
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 relative">
                      <Avatar className="h-12 w-12 rounded-full overflow-hidden mt-2">
                        {contact.image ? (
                          <AvatarImage
                            src={`${HOST}/${contact.image}`}
                            alt="profile"
                            className="object-cover h-full w-full bg-black rounded-full"
                            aria-label="User Profile Image"
                          />
                        ) : (
                          <div
                            className={`uppercase h-full w-full font-bold text-lg border flex items-center justify-center rounded-full ${getColor(
                              contact.color
                            )}`}
                            aria-label="User Initial"
                          >
                            {contact.firstName ? contact.firstName.split("").shift() :
                              contact.email.split("").shift()}
                          </div>
                        )}
                      </Avatar>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span>
                        {contact.firstName && contact.lastName
                          ? `${contact.firstName} ${contact.lastName}`
                          : contact.email}
                      </span>
                      <span className="text-xs">{contact.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {searchedContacts.length === 0 && (
            <div
              className="flex-1 flex flex-col justify-center items-center bg-[#181920] text-opacity-80 text-white transition-all duration-300"
              aria-label="Empty Container"
            >
              <Lottie
                animationData={animationDefaultOptions.animationData}
                loop={animationDefaultOptions.loop}
                style={{ height: 150, width: 150 }}
              />
              <div className="flex flex-col gap-2 items-center justify-center mt-5 lg:text-2xl text-xl text-center">
                <h2 className="poppins-medium">
                  Hi<span className="text-purple-500">!</span> Search new
                  <span className="text-purple-500"> Contacts</span>
                </h2>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default NewDm