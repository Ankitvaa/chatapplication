import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import API from "../api/api";
import MessageInput from "./MessageInput";
import {
    setMessages,
    addMessage,
    selectMessages,
    selectActiveChat,
} from "../store/chatSlice";

import "./styles.scss";

const socket = io("http://localhost:8080", {
    transports: ["websocket", "polling"],
});

const ChatWindow = ({ user, onBack }) => {
    const dispatch = useDispatch();
    const activeChat = useSelector(selectActiveChat);
    const messages = useSelector((state) =>
        selectMessages(state)(activeChat?._id)
    );

    const [participants, setParticipants] = useState([]);
    const [showParticipants, setShowParticipants] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // ✅ Detect mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!activeChat?._id) return;

        socket.emit("joinChat", activeChat._id);

        const loadMessages = async () => {
            try {
                const { data } = await API.get(`/messages/${activeChat._id}`);
                dispatch(
                    setMessages({
                        chatId: activeChat._id,
                        messages: data.messages || data || [],
                    })
                );
            } catch (err) {
                console.error("❌ Failed to load messages:", err);
            }
        };
        loadMessages();

        // ✅ Fetch chat participants
        const loadParticipants = async () => {
            try {
                console.log('Fetching chat details for ID:', activeChat._id); // Debug: Log chat ID
                const response = await API.get(`/chats/chat/${activeChat._id}`);
                console.log('Full API Response:', response); // Debug: Log full response
                const { data } = response;
                console.log('Response data:', data); // Debug: Log data specifically

                // Check for members in the response
                if (data && data.members) {
                    console.log('Found members in chat:', data.members);
                    setParticipants(data.members);
                } else {
                    console.error('No members found in response:', data);
                    setParticipants([]);
                }
            } catch (err) {
                console.error("❌ Failed to load participants:", err);
                if (err.response) {
                    console.error('Error response:', err.response.data);
                    console.error('Error status:', err.response.status);
                }
                setParticipants([]);
            }
        };
        loadParticipants();

        socket.on("messageReceived", (message) => {
            dispatch(addMessage({ chatId: activeChat._id, message }));
        });

        return () => {
            socket.emit("leaveChat", activeChat._id);
            socket.off("messageReceived");
        };
    }, [activeChat?._id, dispatch]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (text) => {
        if (!text.trim() || !activeChat?._id) return;
        const message = {
            chatId: activeChat._id,
            senderId: user?._id || "anonymous",
            senderName: user?.name || user?.username || "Unknown",
            content: text,
            createdAt: new Date(),
        };

        try {
            await API.post("/messages/message", message);
            socket.emit("newMessage", message);
            dispatch(addMessage({ chatId: activeChat._id, message }));
        } catch (err) {
            console.error("❌ Failed to send message:", err);
        }
    };

    if (!activeChat) return null;

    return (
        <div className="chat-window">
            {/* ✅ Chat Header */}
            <div className="chat-header">
                {isMobile && (
                    <button
                        className="back-button"
                        onClick={onBack}
                        aria-label="Go Back"
                        type="button"
                    >
                        &#8592;
                    </button>
                )}
                <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                    <h3 style={{ margin: 0, fontSize: isMobile ? "16px" : "18px" }}>
                        {(() => {
                            // For group chats, prefer the group name
                            if (activeChat.isGroupChat && activeChat.chatName) {
                                return activeChat.chatName;
                            }
                            
                            // For non-group chats or if no group name, show participants
                            if (participants.length === 0) return "Loading chat...";
                            
                            const otherParticipants = participants.filter(p => p._id !== user?._id);
                            if (otherParticipants.length === 0) return "No other participants";
                            
                            return otherParticipants
                                .map(p => p.name || p.email || "Unnamed")
                                .join(", ");
                        })()}
                    </h3>


                    {/* ✅ Participants Toggle Button */}
                    <button
                        className="participants-button"
                        onClick={() => setShowParticipants(!showParticipants)}
                    >
                        👥 {participants.length}
                    </button>
                </div>
            </div>

            {/* ✅ Participants Dropdown */}
            {showParticipants && (
                <div className="participants-list">
                    {participants.length === 0 ? (
                        <p>No participants found.</p>
                    ) : (
                        <ul>
                            {participants.map((p) => (
                                <li key={p._id}>{p.name || p.email || "Unnamed"}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* ✅ Messages */}
            <div className="messages-container">
                <div className="messages-wrapper">
                    {messages.length === 0 ? (
                        <p className="no-messages">No messages yet.</p>
                    ) : (
                        messages.map((m, i) => (
                            <div
                                key={m._id || i}
                                className={`message ${m.senderId === user._id ? "message-sent" : "message-received"
                                    }`}
                            >
                                <strong>
                                    {m.senderId === user._id ? "You" : m.senderName || "User"}
                                </strong>
                                <p>{m.content}</p>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* ✅ Message Input */}
            <div className="message-input-container">
                <MessageInput onSend={sendMessage} />
            </div>
        </div>
    );
};

export default ChatWindow;
