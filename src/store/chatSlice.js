import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [],
  activeChat: null,
  messages: {},  // Keyed by chat ID
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
      // Also update in chats array if it exists
      if (action.payload?._id) {
        const chatIndex = state.chats.findIndex(chat => chat._id === action.payload._id);
        if (chatIndex !== -1) {
          state.chats[chatIndex] = action.payload;
        }
      }
    },
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(message);
    },
    updateMessage: (state, action) => {
      const { chatId, message } = action.payload;
      const list = state.messages[chatId] || [];
      // Use JSON.stringify for ID comparison to handle different ID shapes (string, {$oid:...}, ObjectId)
      state.messages[chatId] = list.map(m => (
        JSON.stringify(m._id) === JSON.stringify(message._id) ? { ...m, ...message } : m
      ));
    },
    setMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.messages[chatId] = messages;
    },
    updateActiveChatAvatar: (state, action) => {
      if (state.activeChat) {
        state.activeChat.avatar = action.payload;
      }
      // Also update in chats array if it exists
      const chatIndex = state.chats.findIndex(chat => chat._id === state.activeChat?._id);
      if (chatIndex !== -1) {
        state.chats[chatIndex].avatar = action.payload;
      }
    },
  },
});

export const { setChats, setActiveChat, addMessage, updateMessage, setMessages, updateActiveChatAvatar } = chatSlice.actions;

// Selectors
export const selectChats = (state) => state.chat.chats;
export const selectActiveChat = (state) => state.chat.activeChat;
export const selectMessages = (state) => (chatId) => state.chat.messages[chatId] || [];

export default chatSlice.reducer;