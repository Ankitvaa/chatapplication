import { createSlice } from '@reduxjs/toolkit';

const loadUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    return user ? { user: JSON.parse(user), token } : { user: null, token: null };
  } catch (error) {
    console.error('Error loading user from storage:', error);
    return { user: null, token: null };
  }
};

const initialState = loadUserFromStorage();

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      // Save to localStorage
      try {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } catch (error) {
        console.error('Error saving user to storage:', error);
      }
    },
    setToken: (state, action) => {
      state.token = action.payload;
      // Save to localStorage
      if (action.payload) {
        localStorage.setItem('token', action.payload);
      } else {
        localStorage.removeItem('token');
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
});

export const { setUser, setToken, logout } = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user.user;
export const selectToken = (state) => state.user.token;

export default userSlice.reducer;