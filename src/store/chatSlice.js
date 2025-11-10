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
    },
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(message);
    },
    setMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.messages[chatId] = messages;
    },
  },
});

export const { setChats, setActiveChat, addMessage, setMessages } = chatSlice.actions;

// Selectors
export const selectChats = (state) => state.chat.chats;
export const selectActiveChat = (state) => state.chat.activeChat;
export const selectMessages = (state) => (chatId) => state.chat.messages[chatId] || [];

export default chatSlice.reducer;