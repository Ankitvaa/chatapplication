import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, selectTheme } from '../store/themeSlice';
import './themeToggle.scss';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <button className="theme-toggle" onClick={handleToggle} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
      {theme === 'dark' ? (
        <span className="theme-toggle__icon">☀️</span>
      ) : (
        <span className="theme-toggle__icon">🌙</span>
      )}
    </button>
  );
};

export default ThemeToggle;
