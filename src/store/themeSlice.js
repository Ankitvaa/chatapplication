import { createSlice } from '@reduxjs/toolkit';

const loadThemeFromStorage = () => {
  try {
    const theme = localStorage.getItem('theme');
    return theme || 'dark'; // Default to dark theme
  } catch (error) {
    console.error('Error loading theme from storage:', error);
    return 'dark';
  }
};

const initialState = {
  mode: loadThemeFromStorage(),
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload;
      // Save to localStorage
      try {
        localStorage.setItem('theme', action.payload);
      } catch (error) {
        console.error('Error saving theme to storage:', error);
      }
    },
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', state.mode);
      } catch (error) {
        console.error('Error saving theme to storage:', error);
      }
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;

// Selectors
export const selectTheme = (state) => state.theme.mode;

export default themeSlice.reducer;
