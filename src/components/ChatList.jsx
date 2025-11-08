import React, { useEffect, useState } from "react";
import API from "../api/api";

const ChatList = ({ user, onSelectChat }) => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const { data } = await API.get(`/chats/${user._id}`);
        setChats(data);
      } catch (err) {
        console.error("❌ Failed to load chats:", err);
      }
    };
    loadChats();
  }, [user]);

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Chats for {user.name || user.username}</h3>
      {chats.length === 0 ? (
        <p>No chats found.</p>
      ) : (
        chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => onSelectChat(chat)}
            style={{
              cursor: "pointer",
              padding: "0.5rem",
              borderBottom: "1px solid #ddd",
            }}
          >
            💬 {chat.name || chat.chatName || "Unnamed Chat"}
          </div>
        ))
      )}
    </div>
  );
};

export default ChatList;
