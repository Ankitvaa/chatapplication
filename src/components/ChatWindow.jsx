import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import InviteUserModal from "./InviteUserModal";
import RemoveUserModal from "./RemoveUserModal";
import GroupInfo from "./GroupInfo";
import MediaViewer from "./MediaViewer";
import { io } from "socket.io-client";
import API from "../api/api";
import MessageInput from "./MessageInput";
import {
    setMessages,
    addMessage,
    updateMessage,
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
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [userToRemove, setUserToRemove] = useState(null);
    const [notification, setNotification] = useState(null); // ✅ Notification state
    const [viewingMedia, setViewingMedia] = useState(null); // ✅ Media viewer state
    const messagesEndRef = useRef(null);

    const [activeMessageId, setActiveMessageId] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editText, setEditText] = useState("");


    // ✅ ADD THIS: Handler for media from MessageInput
    const handleSendMedia = (mediaData) => {
        if (!activeChat?._id) return;

        socket.emit("uploadMedia", {
            ...mediaData,
            senderId: user._id,
            senderName: user?.name || user?.username || "Unknown",
            chatId: activeChat._id,
        });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // ✅ Notification helper
    const showNotification = (message, type = "info") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000); // Auto-hide after 4s
    };

    const formatTime = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm("Delete this message?")) return;

        try {
            const { data } = await API.delete(`/messages/${messageId}`);

            dispatch(
                setMessages({
                    chatId: activeChat._id,
                    messages: messages.filter(m => m._id !== messageId),
                })
            );

            showNotification(data.message || "Message deleted", "success");
        } catch (err) {
            showNotification("Failed to delete message", "error");
        }
    };

    const handleEditMessage = async (messageId) => {
        if (!editText.trim()) return;

        try {
            const { data } = await API.put(`/messages/${messageId}`, {
                content: editText,
            });

            // Update local state for immediate reflection
            dispatch(updateMessage({ chatId: activeChat._id, message: data }));

            // Notify other clients via socket
            socket.emit("messageEdited", data);

            setEditingMessageId(null);
            setEditText("");
            showNotification("Message updated", "success");
        } catch (err) {
            showNotification("Failed to edit message", "error");
        }
    };



    // ✅ Detect mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ✅ 1. Combined Effect for Joining, Loading, and Socket Listeners
    useEffect(() => {
        if (!activeChat?._id) return;

        // Join chat room
        socket.emit("joinChat", activeChat._id);

        // Function to Load messages
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

        // Function to Load participants
        const loadParticipants = async () => {
            try {
                const { data } = await API.get(`/chats/chat/${activeChat._id}`);
                const chatData = data;
                setParticipants(chatData?.members || []);

                if (chatData && chatData._id) {
                    dispatch(selectActiveChat(chatData));
                }
            } catch (err) {
                console.error("❌ Failed to load participants:", err);
                setParticipants([]);
            }
        };

        loadMessages();
        loadParticipants();

        // ✅ Register socket listeners
        if (!socketListenerAdded.current) {
            socket.on("messageReceived", (message) => {
                dispatch(addMessage({ chatId: message.chatId, message }));
            });

            // Handle message edits broadcast from server
            socket.on("messageEdited", (editedMessage) => {
                dispatch(updateMessage({ chatId: editedMessage.chatId, message: editedMessage }));
            });

            // Handle Media received via socket
            socket.on("mediaReceived", (mediaMessage) => {
                dispatch(addMessage({
                    chatId: activeChat._id,
                    message: mediaMessage
                }));
            });

            socketListenerAdded.current = true;
        }

        // Cleanup function
        return () => {
            socket.off("messageReceived");
            socket.off("mediaReceived");
            socketListenerAdded.current = false;
            socket.emit("leaveChat", activeChat._id);
        };
    }, [activeChat?._id, dispatch]); // Exactly one closing block here

    // ✅ 2. Separate Effect for scrolling
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

    // ✅ Delete entire chat (admin only for groups, any member for 1:1)
    const handleDeleteChat = async () => {
        if (!activeChat?._id) return;

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this chat? This action cannot be undone."
        );

        if (!confirmDelete) return;

        try {
            await API.delete(`/chats/${activeChat._id}`);

            // Leave socket room
            socket.emit("leaveChat", activeChat._id);

            // Clear messages from redux
            dispatch(
                setMessages({
                    chatId: activeChat._id,
                    messages: [],
                })
            );

            showNotification("Chat deleted successfully", "success");
            // Go back to chat list after short delay
            setTimeout(() => onBack(), 500);
        } catch (err) {
            console.error("❌ Failed to delete chat:", err);
            const serverMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            showNotification(`Failed to delete chat: ${serverMessage}`, "error");
        }
    };

    // ✅ Leave group chat (remove yourself from members)
    const handleLeaveChat = async () => {
        if (!activeChat?._id) return;

        const confirmLeave = window.confirm(
            "Are you sure you want to leave this group chat?"
        );

        if (!confirmLeave) return;

        try {
            await API.post(`/chats/${activeChat._id}/leave`);

            // Leave socket room
            socket.emit("leaveChat", activeChat._id);

            // Clear messages from redux
            dispatch(
                setMessages({
                    chatId: activeChat._id,
                    messages: [],
                })
            );

            showNotification("You have left the group", "success");
            // Go back to chat list after short delay
            setTimeout(() => onBack(), 500);
        } catch (err) {
            console.error("❌ Failed to leave chat:", err);
            const serverMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            showNotification(`Failed to leave chat: ${serverMessage}`, "error");
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
            <div className="chat-header" onClick={() => activeChat.isGroupChat && setShowGroupInfo(true)} style={{ cursor: activeChat.isGroupChat ? "pointer" : "default" }}>
                {isMobile && (
                    <button
                        className="back-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onBack();
                        }}
                        aria-label="Go Back"
                        type="button"
                    >
                        &#8592;
                    </button>
                )}
                <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 0 }}>
                        {activeChat.avatar && (
                            <img
                                src={activeChat.avatar}
                                alt={activeChat.chatName || activeChat.name}
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    flexShrink: 0
                                }}
                            />
                        )}
                        <h3 style={{ margin: 0, fontSize: isMobile ? "16px" : "18px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
                    </div>


                    {/* ✅ Participants Toggle Button */}
                    {/* <button
                        className="participants-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowGroupInfo(true);
                        }}
                        title="View group information"
                    >
                        ⋮
                    </button> */}

                    {/* <button
                        className="participants-button"
                        onClick={() => setShowParticipants(!showParticipants)}
                    >
                        👥 {participants.length}
                    </button> */}

                    <button
                        className="invite-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowInviteModal(true);
                        }}
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

            {/* ✅ Group Info Modal */}
            {showGroupInfo && activeChat.isGroupChat && (
                <GroupInfo
                    chat={activeChat}
                    participants={participants}
                    user={user}
                    onClose={() => setShowGroupInfo(false)}
                    onDeleteChat={handleDeleteChat}
                    onLeaveChat={handleLeaveChat}
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
                                className={`message ${m.senderId === user._id ? "message-sent" : "message-received"}`}
                                onMouseLeave={() => setActiveMessageId(null)}
                            >
                                <strong>
                                    {m.senderId === user._id ? "You" : m.senderName || "User"}
                                </strong>

                                <div className="message-content">
                                    {/* ✅ NEW: Check if the message is Media */}
                                    {m.fileUrl ? (
                                        <div className="media-content">
                                            {m.fileType.startsWith("image/") ? (
                                                <img
                                                    src={`http://localhost:8080${m.fileUrl}`}
                                                    alt="Shared media"
                                                    style={{ maxWidth: '250px', borderRadius: '8px', cursor: 'pointer' }}
                                                    onClick={() => setViewingMedia(m)}
                                                    title="Click to view fullscreen"
                                                />
                                            ) : (
                                                <video 
                                                    style={{ maxWidth: '250px', cursor: 'pointer', borderRadius: '8px' }}
                                                    onClick={() => setViewingMedia(m)}
                                                    title="Click to view fullscreen"
                                                >
                                                    <source src={`http://localhost:8080${m.fileUrl}`} type={m.fileType} />
                                                    Your browser does not support the video tag.
                                                </video>
                                            )}
                                            <span className="message-time">{formatTime(m.uploadedAt || m.createdAt)}</span>
                                        </div>
                                    ) : (
                                        /* 📝 Existing Text Rendering Logic */
                                        editingMessageId === m._id ? (
                                            <div className="edit-box">
                                                <input value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus />
                                                <button onClick={() => handleEditMessage(m._id)}>Save</button>
                                                <button onClick={() => setEditingMessageId(null)}>Cancel</button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="message-text">
                                                    {m.content}
                                                    {m.isEdited && <em style={{ marginLeft: 6, fontSize: 12 }}>(edited)</em>}
                                                </span>
                                                <span className="message-time">{formatTime(m.createdAt)}</span>
                                            </>
                                        )
                                    )}

                                    {/* Actions menu: allow delete for media or text; edit only for text */}
                                    {m.senderId === user._id && editingMessageId !== m._id && (
                                        <div className="message-actions">
                                            {!m.fileUrl && (
                                                <>
                                                    <button
                                                        className="message-action-btn"
                                                        onClick={() => {
                                                            setEditingMessageId(m._id);
                                                            setEditText(m.content || "");
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="message-action-btn"
                                                        onClick={() => handleDeleteMessage(m._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}

                                            {m.fileUrl && (
                                                <button
                                                    className="message-action-btn"
                                                    onClick={() => {
                                                        if (window.confirm("Delete this media for everyone?")) {
                                                            handleDeleteMessage(m._id);
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>


            {/* ✅ UPDATE: Pass handleSendMedia to MessageInput */}
            <div className="message-input-container">
                <MessageInput
                    onSend={sendMessage}
                    onSendMedia={handleSendMedia}
                />
            </div>

            {/* ✅ Notification Toast */}
            {notification && (
                <div
                    style={{
                        position: "fixed",
                        top: "20px",
                        right: "20px",
                        padding: "12px 20px",
                        borderRadius: "6px",
                        color: "white",
                        fontWeight: "500",
                        fontSize: "14px",
                        zIndex: 9999,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        animation: "slideIn 0.3s ease-out",
                        backgroundColor:
                            notification.type === "success" ? "#10b981" :
                                notification.type === "error" ? "#ef4444" :
                                    "#3b82f6",
                    }}
                >
                    {notification.message}
                </div>
            )}

            {/* ✅ Media Viewer Modal */}
            {viewingMedia && (
                <MediaViewer
                    media={viewingMedia}
                    onClose={() => setViewingMedia(null)}
                />
            )}

            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default ChatWindow;
