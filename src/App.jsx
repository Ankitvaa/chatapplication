import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ChatWindow from "./components/ChatWindow";
import Login from "./components/Login";
import ChatList from "./components/ChatList";
import UserProfile from "./components/UserProfile";
import { selectActiveChat, setActiveChat } from "./store/chatSlice";
import { selectUser } from "./store/userSlice";
import "./App.css";

function App() {
  // All hooks at the top level
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const activeChat = useSelector(selectActiveChat);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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
            className={`chat-list-container ${
              isMobile && activeChat ? "hidden-mobile" : ""
            }`}
          >
            <ChatList user={user} />
          </div>
        )}

        {/* Chat Window Section */}
        {showChatWindow && (
          <div
            className={`chat-window-container ${
              isMobile && !activeChat ? "hidden-mobile" : ""
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

        {/* User Profile Section */}
        {!isMobile && <UserProfile />}
      </div>
    </div>
  );
}

export default App;
