import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ChatWindow from "./components/ChatWindow";
import Login from "./components/Login";
import ChatList from "./components/ChatList";
import UserProfile from "./components/UserProfile";
import ThemeToggle from "./components/ThemeToggle";
import { selectActiveChat, setActiveChat } from "./store/chatSlice";
import { selectUser } from "./store/userSlice";
import { selectTheme } from "./store/themeSlice";
import "./styles/themes.scss";
import "./App.scss";

function App() {
  // All hooks at the top level
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const activeChat = useSelector(selectActiveChat);
  const theme = useSelector(selectTheme);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine which container is visible
  const showChatList = !isMobile || (isMobile && !activeChat);
  const showChatWindow = !isMobile || (isMobile && activeChat);

  // Only use conditional return for rendering
  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

  return (
    <div className="app-container">
      <div className="chat-layout">
        {/* Chat List Section */}
        {showChatList && (
          <div
            className={`chat-list-container ${isMobile && activeChat ? "hidden-mobile" : ""
              }`}
          >
            <div className="chat-list-scroll">
              <ChatList user={user} />
            </div>
            {/* User Profile Section - Fixed at bottom */}
            {!isMobile && <UserProfile />}
          </div>
        )}

        {/* Chat Window Section */}
        {showChatWindow && (
          <div
            className={`chat-window-container ${isMobile && !activeChat ? "hidden-mobile" : ""
              }`}
          >
            {activeChat ? (
              <ChatWindow
                user={user}
                onBack={() => dispatch(setActiveChat(null))}
              />
            ) : (
              <div className="no-chat-selected">
                <p>Select a chat to start messaging</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
