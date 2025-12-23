import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import InviteUserModal from "./InviteUserModal";
import RemoveUserModal from "./RemoveUserModal";
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
    const socketListenerAdded = useRef(false);
    const dispatch = useDispatch();
    const activeChat = useSelector(selectActiveChat);
    const messages = useSelector((state) =>
        selectMessages(state)(activeChat?._id)
    );

    const [participants, setParticipants] = useState([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [userToRemove, setUserToRemove] = useState(null);
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

        // Join chat room
        socket.emit("joinChat", activeChat._id);

        // Load messages
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

        // Load participants
        const loadParticipants = async () => {
            try {
                const { data } = await API.get(`/chats/chat/${activeChat._id}`);
                setParticipants(data?.members || []);
            } catch (err) {
                console.error("❌ Failed to load participants:", err);
                setParticipants([]);
            }
        };

        loadMessages();
        loadParticipants();

        // ✅ Register socket listener ONLY ONCE
        if (!socketListenerAdded.current) {
            socket.on("messageReceived", (message) => {
                dispatch(
                    addMessage({
                        chatId: message.chatId,
                        message,
                    })
                );
            });

            socketListenerAdded.current = true;
        }

        return () => {
            socket.emit("leaveChat", activeChat._id);
        };
    }, [activeChat?._id, dispatch]);


    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (text) => {
        if (!text.trim() || !activeChat?._id) return;

        const message = {
            chatId: activeChat._id,
            senderId: user?._id,
            senderName: user?.name || user?.username || "Unknown",
            content: text,
        };

        try {
            await API.post("/messages/message", message);
            socket.emit("newMessage", message);
        } catch (err) {
            console.error("❌ Failed to send message:", err);
        }
    };


    const removeParticipant = (participant) => {
        setUserToRemove(participant);
    };

    const handleUserRemoved = (userId) => {
        setParticipants(participants.filter(p => p._id !== userId));
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

                    <button
                        className="invite-button"
                        onClick={() => setShowInviteModal(true)}
                    >
                        ✉️ Invite
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
                                <li key={p._id} className="participant-item">
                                    <span>{p.name || p.email || "Unnamed"}</span>
                                    {p._id !== user?._id && (
                                        <button
                                            className="remove-participant-btn"
                                            onClick={() => removeParticipant(p)}
                                            title="Remove participant"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {showInviteModal && (
                <InviteUserModal
                    chatId={activeChat._id}
                    onClose={() => setShowInviteModal(false)}
                />
            )}

            {userToRemove && (
                <RemoveUserModal
                    user={userToRemove}
                    chatId={activeChat._id}
                    onClose={() => setUserToRemove(null)}
                    onUserRemoved={handleUserRemoved}
                />
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
