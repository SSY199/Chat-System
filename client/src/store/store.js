import { create } from "zustand";
import { createAuthSlice } from "./slices/authSlice.js";
import { createChatSlice } from "./slices/chatSlice.js";


export const useAppStore = create()((...a) => ({
  ...createAuthSlice(...a),
  ...createChatSlice(...a),
}));
