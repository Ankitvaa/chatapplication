import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';
import userReducer from './userSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    user: userReducer,
    theme: themeReducer,
  },
});