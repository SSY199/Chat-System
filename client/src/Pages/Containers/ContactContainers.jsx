import React, { useEffect } from "react";
import ProfileInfo from "./ChatContainer/ProfileInfo";
import NewDm from "./ChatContainer/NewDm";
import apiClient from "@/lib/api-client.js";
import { GET_CHANNELS_ROUTES, GET_CONTACTS_FOR_DM_ROUTES } from "@/utils/constants";
import ContactList from "./ChatContainer/ContactList";
import { useAppStore } from "@/store/store.js";
import CreateChannel from "../Channel/CreateChannel";

const ContactContainers = () => {
  const { directMessagesContacts, setDirectMessagesContacts, channels, setChannels } = useAppStore();

  useEffect(() => {
    const getContacts = async () => {
      const response = await apiClient.get(GET_CONTACTS_FOR_DM_ROUTES, {
        withCredentials: true,
      });
      if(response.data.contacts){
        setDirectMessagesContacts(response.data.contacts);
      }
    };
    const getChannels = async () => {
      const response = await apiClient.get(GET_CHANNELS_ROUTES, {
        withCredentials: true,
      });
      if(response.data.channels){
        setChannels(response.data.channels);
      }
    };

    getContacts();
    getChannels();
  }, [setChannels, setDirectMessagesContacts]);

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 bg-[#1b1c24] border-r border-[#2f303b] border-opacity-80 shadow-lg flex flex-col h-screen">
      {/* Header with Logo */}
      <div className="pt-6 px-6 pb-4  ">
        <Logo />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Contacts Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <Title text="Direct Messages" />
            <NewDm />
          </div>
          <div className="max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2f303b] scrollbar-track-transparent">
            <ContactList contacts={directMessagesContacts} />
          </div>
        </div>

        {/* Channels Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <Title text="Channels" />
            <CreateChannel />
          </div>
          <div className="max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2f303b] scrollbar-track-transparent">
            <ContactList contacts={channels} isChannel={true} />
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 py-4 border-t border-[#2f303b] border-opacity-80">
        <ProfileInfo />
      </div>
    </div>
  );
};

export default ContactContainers;

const Logo = () => {
  return (
    <div className="flex justify-start items-center gap-2 md:gap-3 transition-transform duration-300 hover:scale-105">
      <svg
        id="logo-38"
        width="48"
        height="24"
        viewBox="0 0 78 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 md:w-12"
      >
        <path
          d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
          fill="#8383ec"
        />
        <path
          d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
          fill="#975aed"
        />
        <path
          d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
          fill="#a16ee8"
        />
      </svg>
      <span className="text-xl md:text-2xl font-semibold text-white drop-shadow-md hover:text-purple-500 transition-colors duration-300">
        Synchronous
      </span>
    </div>
  );
};

const Title = ({ text }) => {
  return (
    <h6 className="uppercase tracking-wider text-neutral-400 font-light text-sm md:text-base lg:text-lg hover:scale-105 transition-transform duration-300">
      {text}
    </h6>
  );
};
