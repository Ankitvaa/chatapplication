import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import API from "../api/api";
import { setChats, setActiveChat, selectChats } from "../store/chatSlice";
import "./styles.scss";
import CreateGroupModal from "./CreateGroupModal";

const ChatList = ({ user }) => {
  const dispatch = useDispatch();
  const chats = useSelector(selectChats);

  const [showCreateModal, setShowCreateModal] = useState(false);

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

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleSelectChat = (chat) => {
    if (!chat || !chat._id) return;
    dispatch(setActiveChat(chat));
  };

  return (
    <div className="chat-list">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0 }}>Chats for {user.name || user.username}</h3>
        <button
          className="participants-button"
          onClick={() => setShowCreateModal(true)}
          style={{ fontSize: 14, padding: '6px 10px' }}
        >
          ➕ Create Group
        </button>
      </div>

      {chats.length === 0 ? (
        <p>No chats found.</p>
      ) : (
        chats.map((chat) => (
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
            💬 {chat.chatName || chat.name || "Unnamed Chat"}
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
            // Add new chat to the list immediately if it doesn't already exist
            if (newChat && !chats.find(c => c._id === newChat._id)) {
              dispatch(setChats([newChat, ...chats]));
              console.log("✅ Chat added to list");
            }
          }}
        />
      )}
    </div>
  );
};

export default ChatList;
