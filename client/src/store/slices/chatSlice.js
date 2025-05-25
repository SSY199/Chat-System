export const createAuthSlice = (set) => ({
  userInfo: null,
  setUserInfo: (userInfo) => set({ userInfo }),
});
export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMesssage: [],
  directMessagesContacts: [],
  isUploading:false,
  isDownloading: false,
  fileUploadProgress: 0,
  fileDownloadProgress: 0,
  channels: [],


  
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatMessage: (selectedChatMessage) => set({ selectedChatMessage }),
  setDirectMessagesContacts: (directMessagesContacts) =>
    set({ directMessagesContacts }),
  setIsUploading: (isUploading) => set({
    isUploading
  }),
  setIsDownloading: (isDownloading) => ({
    isDownloading
  }),
  setFileUploadProgress: (fileUploadProgress) => ({
    fileUploadProgress
  }),
  setFileDownloadProgress: (fileDownloadProgress) => ({
    fileDownloadProgress
  }),
  setChannels: (channels) => set({ channels }),
  


  closeChat: () => {
    set({
      selectedChatData: undefined,
      selectedChatType: undefined,
      selectedChatMesssage: [],
    });
  },

  addMessage: (message) => {
    const selectedChatMesssage = get().selectedChatMesssage;
    const selectedChatType = get().selectedChatType;

    set({
      selectedChatMesssage: [
        ...selectedChatMesssage,
        {
          ...message,
          recipient:
            selectedChatType === "channel"
              ? message.recipient
              : message.recipient._id,
          sender:
            selectedChatType === "channel" ? message.sender : message.sender._id,
        },
      ],
    });
  },

  addChannel: (channel) => {
    const channels = get().channels;
    set({channels: [channel, ...channels]});
  },

  addChannelInList: (message) => {
    const channels = get().channels;
    const data = channels.find((channel) => channel._id === message.channelId);
    const index = channels.findIndex((channel) => channel._id === message.channelId);
    if(index !== -1 && index !== undefined){
      channels.splice(index, 1);
      channels.unshift(data);
    }
  },

  addContactsInDMContacts: (message) => {
    const userId = get().userInfo.id;
    const fromId = 
      message.sender._id === userId 
        ? message.recipient._id 
        : message.sender._id;
  
    const fromData = 
      message.sender._id === userId 
        ? message.recipient 
        : message.sender;
  
    const dmContacts = get().directMessagesContacts;
  
    const data = dmContacts.find((contact) => contact._id === fromId);
    const index = dmContacts.findIndex((contact) => contact._id === fromId);
  
    //console.log({ data, index, dmContacts, userId, message, fromData });
  
    if (index !== -1 && index !== undefined) {
      dmContacts.splice(index, 1);
      dmContacts.unshift(data);
    } else {
      dmContacts.unshift(fromData);
    }
  
    set({ directMessagesContacts: dmContacts });
  },
  

});