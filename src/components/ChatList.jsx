import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import API from "../api/api";
import { setChats, setActiveChat, selectChats } from "../store/chatSlice";
import "./styles.scss";
import CreateGroupModal from "./CreateGroupModal";
import UserProfileInfo from "./UserProfileInfo";

const ChatList = ({ user }) => {
  const dispatch = useDispatch();
  const chats = useSelector(selectChats);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Reusable function to load chats
  const loadChats = useCallback(async () => {
    try {
      if (!user?._id) return;
      const { data } = await API.get(`/chats/${user._id}`);
      dispatch(setChats(data));
    } catch (err) {
      console.error("❌ Failed to load chats:", err);
    }
  }, [user, dispatch]);

  // Detect mobile resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleSelectChat = (chat) => {
    if (!chat || !chat._id) return;
    dispatch(setActiveChat(chat));
  };

  // Helper function to get avatar letter
  const getAvatarLetter = (chat) => {
    if (chat.chatName) {
      return chat.chatName.charAt(0).toUpperCase();
    }
    if (chat.name) {
      return chat.name.charAt(0).toUpperCase();
    }
    return 'C'; // Default to 'C' for Chat
  };

  // Helper function to get avatar display (image or letter)
  const getAvatarDisplay = (chat) => {
    if (chat.avatar) {
      return (
        <img
          src={chat.avatar}
          alt={chat.chatName || chat.name}
          className="chat-list__item-avatar-image"
        />
      );
    }
    return getAvatarLetter(chat);
  };

  // Filter chats based on search query
  const filteredChats = chats.filter((chat) => {
    const chatName = (chat.chatName || chat.name || "").toLowerCase();
    return chatName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="chat-list">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: '1rem' }}>
        {isMobile ? (
          <>
            <h3 style={{ margin: 0 ,flex: 1 }}>Chats for {user.name || user.username}</h3>
            <button
              className="participants-button"
              onClick={() => setShowUserProfile(true)}
              title="View your profile"
              style={{
                fontSize: 20,
                padding: '6px 10px',
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                marginRight: "0.5rem",
                transition: "transform 0.2s ease"
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
              ⋮
            </button>
            <button
              className="participants-button"
              onClick={() => setShowCreateModal(true)}
              title="Create New Group"
              style={{
                fontSize: 18,
                padding: '6px 10px',
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "transform 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 13C14.7614 13 17 10.7614 17 8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8C7 10.7614 9.23858 13 12 13Z" fill="#007AFF" />
                <path d="M12 14.5C8.13401 14.5 5 17.634 5 21.5V22H19V21.5C19 17.634 15.866 14.5 12 14.5Z" fill="#007AFF" />
                <circle cx="18" cy="18" r="5" fill="#007AFF" stroke="#FFFFFF" strokeWidth="2" />
                <path d="M18 16V20M16 18H20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <h3 style={{ margin: 0 }}>Chats for {user.name || user.username}</h3>
            <button
              className="participants-button"
              onClick={() => setShowCreateModal(true)}
              title="Create New Group"
              style={{
                fontSize: 18,
                padding: '8px 12px',
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "transform 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 13C14.7614 13 17 10.7614 17 8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8C7 10.7614 9.23858 13 12 13Z" fill="#007AFF" />
                <path d="M12 14.5C8.13401 14.5 5 17.634 5 21.5V22H19V21.5C19 17.634 15.866 14.5 12 14.5Z" fill="#007AFF" />
                <circle cx="18" cy="18" r="5" fill="#007AFF" stroke="#FFFFFF" strokeWidth="2" />
                <path d="M18 16V20M16 18H20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </>
        )}
      </div>
      <div style={{ padding: '0 1rem 1rem 1rem' }}>
        <input
          type="text"
          placeholder="🔍 Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="chat-search-input"
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid var(--border-color, #ddd)",
            backgroundColor: "var(--bg-secondary, #f5f5f5)",
            color: "var(--text-primary, #333)",
            fontSize: "14px",
            boxSizing: "border-box",
            transition: "all 0.3s ease",
            outline: "none",
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = "0 0 5px var(--primary-color, #007bff)";
            e.target.style.borderColor = "var(--primary-color, #007bff)";
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = "none";
            e.target.style.borderColor = "var(--border-color, #ddd)";
          }}
        />
      </div>

      {filteredChats.length === 0 ? (
        <p style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary, #666)' }}>
          {searchQuery ? "No chats found." : "No chats yet."}
        </p>
      ) : (
        filteredChats.map((chat) => (
          <div
            key={chat._id}
            className="chat-list__item"
            onClick={() => handleSelectChat(chat)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ") handleSelectChat(chat);
            }}
          >
            <div className="chat-list__item-avatar">
              {getAvatarDisplay(chat)}
            </div>
            <div className="chat-list__item-content">
              <p className="chat-list__item-name">{chat.chatName || chat.name || "Unnamed Chat"}</p>
            </div>
          </div>
        ))
      )}

      {showCreateModal && (
        <CreateGroupModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={(newChat) => {
            setShowCreateModal(false);
            console.log("📢 New chat created:", newChat);
            console.log("🖼️ Chat avatar:", newChat.avatar);
            // Add new chat to the list immediately if it doesn't already exist
            if (newChat && !chats.find(c => c._id === newChat._id)) {
              const updatedChats = [newChat, ...chats];
              console.log("📋 Updated chats array:", updatedChats);
              dispatch(setChats(updatedChats));
              console.log("✅ Chat added to list");
            } else if (newChat) {
              // Chat already exists, update it with new avatar
              const updatedChats = chats.map(c => c._id === newChat._id ? newChat : c);
              dispatch(setChats(updatedChats));
              console.log("🔄 Chat updated with avatar");
            }
          }}
        />
      )}

      {showUserProfile && (
        <UserProfileInfo
          user={user}
          onClose={() => setShowUserProfile(false)}
          onLogout={() => {
            setShowUserProfile(false);
            window.location.href = '/login';
          }}
        />
      )}
    </div>
  );
};

export default ChatList;
