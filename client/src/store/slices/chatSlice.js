export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessage: [],
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
  setIsDownloading: (isDownloading) => set({
    isDownloading
  }),
  setFileUploadProgress: (fileUploadProgress) => set({
    fileUploadProgress
  }),
  setFileDownloadProgress: (fileDownloadProgress) => set({
    fileDownloadProgress
  }),
  setChannels: (channels) => set({ channels }),
  


  closeChat: () => {
    set({
      selectedChatData: undefined,
      selectedChatType: undefined,
      selectedChatMessage: [],
    });
  },

  addMessage: (message) => {
    const selectedChatMessage = get().selectedChatMessage;
    const selectedChatType = get().selectedChatType;

    const getId = (value) => {
      if (value == null) return value;
      if (typeof value === "object") return value._id ?? value.id;
      return value;
    };

    // Avoid duplicate bubbles if the same message is echoed twice
    if (message._id && selectedChatMessage.some((m) => String(m._id) === String(message._id))) {
      return;
    }

    set({
      selectedChatMessage: [
        ...selectedChatMessage,
        {
          ...message,
          recipient:
            selectedChatType === "channel"
              ? message.recipient
              : getId(message.recipient),
          sender:
            selectedChatType === "channel" ? message.sender : getId(message.sender),
        },
      ],
    });
  },

  addChannel: (channel) => {
    //const channels = get().channels;
    set(state => ({
      channels: [channel, ...state.channels]
    }));
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
    const userId = String(get().userInfo.id);
    const senderId = String(message.sender?._id ?? message.sender);
    const recipientId = String(message.recipient?._id ?? message.recipient);
    const fromId = senderId === userId ? recipientId : senderId;

    const fromData =
      senderId === userId ? message.recipient : message.sender;

    const dmContacts = get().directMessagesContacts;

    const data = dmContacts.find((contact) => String(contact._id) === fromId);
    const index = dmContacts.findIndex((contact) => String(contact._id) === fromId);
  
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