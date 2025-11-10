import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import API from "../api/api";
import { setChats, setActiveChat, selectChats } from "../store/chatSlice";
import "./styles.scss";

const ChatList = ({ user }) => {
  const dispatch = useDispatch();
  const chats = useSelector(selectChats);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const { data } = await API.get(`/chats/${user._id}`);
        dispatch(setChats(data));
      } catch (err) {
        console.error("❌ Failed to load chats:", err);
      }
    };
    loadChats();
  }, [user, dispatch]);

  const handleSelectChat = (chat) => {
    console.log("Selected chat:", chat); // Debug logging
    if (!chat || !chat._id) {
      console.error("Invalid chat object:", chat);
      return;
    }
    dispatch(setActiveChat(chat));
  };

  // Debug: Log current chats state
  useEffect(() => {
    console.log("Current chats:", chats);
  }, [chats]);

  return (
    <div className="chat-list">
      <h3>Chats for {user.name || user.username}</h3>
      {chats.length === 0 ? (
        <p>No chats found.</p>
      ) : (
        chats.map((chat) => (
          <div
            key={chat._id}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSelectChat(chat);
            }}
            className="chat-list__item"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectChat(chat);
              }
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
