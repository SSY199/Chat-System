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
// import { animationDefaultOptions } from "@/lib/utils.js";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api-client.js";
import {
  CREATE_CHANNELS_ROUTES,
  GET_ALL_CONTACTS_ROUTES,
  SEARCH_CONTACTS_ROUTES,
} from "@/utils/constants.js";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HOST } from "@/utils/constants.js";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { getColor } from "@/lib/utils.js";
import { useAppStore } from "@/store/store.js";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";

const CreateChannel = () => {
  const { addChannel } = useAppStore();
  const [newChannelModal, setNewChannelModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");

  //const { userInfo } = useAppStore();

  useEffect(() => {
    const data = async () => {
      const res = await apiClient.get(GET_ALL_CONTACTS_ROUTES, {
        withCredentials: true,
      });
      setAllContacts(res.data.contacts);
    };
    data();
  }, []);

  const createChannel = async () => {
    try {
      if (channelName.length > 0 && selectedContacts.length > 0) {
        const response = await apiClient.post(
          CREATE_CHANNELS_ROUTES,
          {
            name: channelName,
            members: selectedContacts.map((contact) => contact.value),
          },
          {
            withCredentials: true,
          }
        );
        if (response.status === 201) {
          setChannelName("");
          setSelectedContacts([]);
          addChannel(response.data.channel);
          setNewChannelModal(false);
        } else {
          setChannelName("");
          setSelectedContacts([]);
          setNewChannelModal(false);
        }
      }
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  // const searchContact = async (searchTerm) => {
  //   try {
  //     if(searchTerm.length > 0) {
  //       const response = await apiClient.post(SEARCH_CONTACTS_ROUTES, {
  //         searchTerm,
  //       }, {
  //         withCredentials: true,
  //       });

  //       if(response.status === 200) {
  //         setSearchedContacts(response.data.contacts);
  //       } else {
  //         setSearchedContacts([]);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error fetching contacts:", error);
  //   }
  // }

  // const selectNewContact = async (contact) => {
  //   try {
  //     setNewChannelModal(false);
  //     setSelectedChatType("contact");
  //     setSelectedChatData(contact);
  //     setSearchedContacts([]);
  //     // const response = await apiClient.post(SEARCH_CONTACTS_ROUTES, {
  //     //   searchTerm,
  //     // }, {
  //     //   withCredentials: true,
  //     // });

  //     // if(response.status === 200) {
  //     //   setSearchedContacts(response.data.contacts);
  //     // } else {
  //     //   setSearchedContacts([]);
  //     // }
  //   } catch (error) {
  //     console.error("Error fetching contacts:", error);
  //   }
  // }

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
              onClick={() => setNewChannelModal(true)}
            />
            <TooltipContent
              side="top"
              className="bg-[#1c1b1e] border-none mb-2 p-3 text-white rounded-md shadow-lg"
            >
              Create New Channel
            </TooltipContent>
          </TooltipTrigger>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>Fill the details for new Channel</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="px-2">
            <Input
              type="text"
              placeholder="Channel Name"
              className="bg-[#1c1b1e] border-none text-white w-full h-10 rounded-lg shadow-lg mb-4"
              onChange={(e) => setChannelName(e.target.value)}
              value={channelName}
            />
          </div>
          <div className="">
            <MultipleSelector
              className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
              defaultOptions={allContacts}
              placeholder="Search Contacts"
              value={selectedContacts}
              onChange={setSelectedContacts}
              emptyIndicator={
                <p className="text-center text-lg leading-10 text-gray-600">
                  {" "}
                  No results found.
                </p>
              }
            />
          </div>
          <div className="">
            <Button
              className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
              onClick={createChannel}
            >
              Create Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateChannel;
