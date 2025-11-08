import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import API from "../api/api";
import MessageInput from "./MessageInput";

// ✅ Connect to your backend Socket.IO server
const socket = io("http://localhost:8080", {
    transports: ["websocket", "polling"],
});

const ChatWindow = ({ user, chatId, onBack,chatName }) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!chatId) return;

        console.log(`📡 Joining chat: ${chatId}`);
        console.log(`${chatName}`)
        socket.emit("joinChat", chatId);

        // ✅ Fetch existing messages from backend
        const loadMessages = async () => {
            try {
                const { data } = await API.get(`/messages/${chatId}`);
                setMessages(data.messages || data || []);
            } catch (err) {
                console.error("❌ Failed to load messages:", err);
            }
        };
        loadMessages();

        // ✅ Listen for new incoming messages
        socket.on("messageReceived", (message) => {
            console.log("📩 New message received:", message);
            setMessages((prev) => [...prev, message]);
        });

        // ✅ Cleanup on unmount
        return () => {
            socket.emit("leaveChat", chatId);
            socket.off("messageReceived");
        };
    }, [chatId]);

    // ✅ Send a message
    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const message = {
            chatId,
            senderId: user?._id || "anonymous",
            senderName: user?.name || user?.username || "Unknown",
            content: text,
            createdAt: new Date(),
        };

        console.log("📤 Sending message payload:", message);

        try {
            await API.post("/messages/message", message);
            socket.emit("newMessage", message);
            setMessages((prev) => [...prev, message]);
        } catch (err) {
            console.error("❌ Failed to send message:", err);
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <button onClick={onBack} style={{ marginBottom: "1rem" }}>
                ⬅ Back to Chats
            </button>

            <h3>Chat Room: {chatName}</h3>

            <div
                style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "1rem",
                    height: "300px",
                    overflowY: "auto",
                    backgroundColor: "#f9f9f9",
                }}
            >
                {messages.length === 0 ? (
                    <p>No messages yet.</p>
                ) : (
                    messages.map((m, i) => (
                        <p key={m._id || i}>
                            <strong>
                                {m.senderId === user._id ? "You" : m.senderName || "User"}:
                            </strong>{" "}
                            {m.content}
                        </p>
                    ))
                )}
            </div>

            <MessageInput onSend={sendMessage} />
        </div>
    );
};

export default ChatWindow;
